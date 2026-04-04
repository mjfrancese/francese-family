"""Flight search API — thin FastAPI wrapper around the fli library."""

from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fli.models import (
    Airport,
    PassengerInfo,
    SeatType,
    MaxStops,
    SortBy,
    FlightSearchFilters,
    FlightSegment,
)
from fli.search import SearchFlights

app = FastAPI(title="Flight Search API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ── Request schema ──────────────────────────────────────────────

class SearchRequest(BaseModel):
    origin: str          # IATA code e.g. "JFK"
    destination: str     # IATA code e.g. "LHR"
    date: str            # YYYY-MM-DD
    return_date: str | None = None
    adults: int = 1
    children: int = 0
    cabin: str = "ECONOMY"   # ECONOMY | PREMIUM_ECONOMY | BUSINESS | FIRST
    stops: str = "ANY"       # ANY | NON_STOP | ONE_STOP_OR_FEWER | TWO_OR_FEWER_STOPS
    sort: str = "BEST"       # BEST | CHEAPEST | DURATION | DEPARTURE_TIME | ARRIVAL_TIME

# ── Helpers ─────────────────────────────────────────────────────

SEAT_MAP = {
    "ECONOMY": SeatType.ECONOMY,
    "PREMIUM_ECONOMY": SeatType.PREMIUM_ECONOMY,
    "BUSINESS": SeatType.BUSINESS,
    "FIRST": SeatType.FIRST,
}

STOPS_MAP = {
    "ANY": MaxStops.ANY,
    "NON_STOP": MaxStops.NON_STOP,
    "ONE_STOP_OR_FEWER": MaxStops.ONE_STOP_OR_FEWER,
    "TWO_OR_FEWER_STOPS": MaxStops.TWO_OR_FEWER_STOPS,
}

SORT_MAP = {
    "BEST": SortBy.BEST,
    "CHEAPEST": SortBy.CHEAPEST,
    "DURATION": SortBy.DURATION,
    "DEPARTURE_TIME": SortBy.DEPARTURE_TIME,
    "ARRIVAL_TIME": SortBy.ARRIVAL_TIME,
}


def resolve_airport(code: str) -> Airport:
    code = code.strip().upper()
    try:
        return Airport[code]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Unknown airport code: {code}")


def format_duration(minutes: int) -> str:
    h, m = divmod(minutes, 60)
    return f"{h}h {m}m" if m else f"{h}h"


def serialize_leg(leg) -> dict:
    return {
        "airline": leg.airline.name,
        "flightNumber": leg.flight_number,
        "from": leg.departure_airport.name,
        "to": leg.arrival_airport.name,
        "departure": leg.departure_datetime.isoformat(),
        "arrival": leg.arrival_datetime.isoformat(),
        "duration": leg.duration,
        "durationFormatted": format_duration(leg.duration),
    }


def serialize_result(result) -> dict:
    return {
        "price": result.price,
        "currency": result.currency or "USD",
        "duration": result.duration,
        "durationFormatted": format_duration(result.duration),
        "stops": result.stops,
        "legs": [serialize_leg(leg) for leg in result.legs],
    }

# ── Endpoint ────────────────────────────────────────────────────

@app.post("/api/flights/search")
async def search_flights(req: SearchRequest):
    origin = resolve_airport(req.origin)
    destination = resolve_airport(req.destination)

    segments = [
        FlightSegment(
            departure_airport=[[origin, 0]],
            arrival_airport=[[destination, 0]],
            travel_date=req.date,
        )
    ]

    from fli.models import TripType
    trip_type = TripType.ONE_WAY

    if req.return_date:
        trip_type = TripType.ROUND_TRIP
        segments.append(
            FlightSegment(
                departure_airport=[[destination, 0]],
                arrival_airport=[[origin, 0]],
                travel_date=req.return_date,
            )
        )

    filters = FlightSearchFilters(
        trip_type=trip_type,
        passenger_info=PassengerInfo(adults=req.adults, children=req.children),
        flight_segments=segments,
        seat_type=SEAT_MAP.get(req.cabin, SeatType.ECONOMY),
        stops=STOPS_MAP.get(req.stops, MaxStops.ANY),
        sort_by=SORT_MAP.get(req.sort, SortBy.BEST),
    )

    try:
        searcher = SearchFlights()
        results = searcher.search(filters, top_n=20)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Flight search failed: {e}")

    if not results:
        return {"flights": [], "outbound": [], "returnFlights": []}

    # One-way: list of FlightResult
    if not req.return_date:
        return {"flights": [serialize_result(r) for r in results]}

    # Round-trip: list of tuples (outbound, return)
    outbound = []
    return_flights = []
    seen_out = set()
    seen_ret = set()

    for combo in results:
        out, ret = combo[0], combo[1]
        out_key = (out.legs[0].flight_number, out.legs[0].departure_datetime.isoformat())
        ret_key = (ret.legs[0].flight_number, ret.legs[0].departure_datetime.isoformat())
        if out_key not in seen_out:
            outbound.append(serialize_result(out))
            seen_out.add(out_key)
        if ret_key not in seen_ret:
            return_flights.append(serialize_result(ret))
            seen_ret.add(ret_key)

    return {
        "flights": [],
        "outbound": outbound,
        "returnFlights": return_flights,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=4001)
