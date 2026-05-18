"""Flight search for St. Augustine trip (Jul 15-18, 2026): STL <-> JAX, 4 pax (3 adults + 1 toddler)."""
import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')


def search_oneway(origin, dest, date, adults=3, children=1, stops='ANY', sort='BEST'):
    body = json.dumps({
        'origin': origin, 'destination': dest,
        'date': date,
        'adults': adults, 'children': children,
        'cabin': 'ECONOMY', 'stops': stops, 'sort': sort
    }).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:4001/api/flights/search',
        data=body, headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except Exception as e:
        return {'error': str(e)}


def print_results(label, result, top=12):
    if 'error' in result:
        print(f"  {label}: ERROR {result['error']}")
        return
    flights = result.get('flights', [])
    print(f"\n  {label} — {len(flights)} results")
    for i, f in enumerate(flights[:top]):
        legs = f['legs']
        airlines = '/'.join(sorted({l['airline'] for l in legs}))
        dep = legs[0]['departure'][11:16]
        arr = legs[-1]['arrival'][11:16]
        stops = f['stops']
        slabel = 'nonstop' if stops == 0 else f"{stops}stop"
        price = int(f['price'])
        dur = f['durationFormatted']
        flight_nums = '/'.join(l['flightNumber'] for l in legs)
        print(f"    ${price:>4}  {airlines:<14} {dep}->{arr}  {dur:>7}  {slabel:<7}  {flight_nums}")


print("=" * 72)
print("OUTBOUND: STL -> JAX  (Wed Jul 15, 2026)  -- 3 adults + 1 child")
print("=" * 72)
for d in ['2026-07-15']:
    print_results(f"All ({d})", search_oneway('STL', 'JAX', d, sort='BEST'), top=15)
    print_results(f"Cheapest ({d})", search_oneway('STL', 'JAX', d, sort='CHEAPEST'), top=10)
    print_results(f"Nonstop only ({d})", search_oneway('STL', 'JAX', d, stops='NON_STOP', sort='BEST'), top=10)

print("\n" + "=" * 72)
print("RETURN: JAX -> STL  (Sat Jul 18, 2026)  -- 3 adults + 1 child")
print("=" * 72)
for d in ['2026-07-18']:
    print_results(f"All ({d})", search_oneway('JAX', 'STL', d, sort='BEST'), top=15)
    print_results(f"Cheapest ({d})", search_oneway('JAX', 'STL', d, sort='CHEAPEST'), top=10)
    print_results(f"Nonstop only ({d})", search_oneway('JAX', 'STL', d, stops='NON_STOP', sort='BEST'), top=10)

print("\n" + "=" * 72)
print("ALT: STL -> DAB / MCO  (Wed Jul 15, 2026) -- nonstop check")
print("=" * 72)
for apt in ['DAB', 'MCO']:
    print_results(f"STL->{apt} 2026-07-15 nonstop", search_oneway('STL', apt, '2026-07-15', stops='NON_STOP', sort='BEST'), top=6)
