"""Full-spectrum STL<->JAX flight comparison for the trip dashboard."""
import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')


def search(origin, dest, date, sort='BEST', stops='ANY', adults=3, children=1):
    body = json.dumps({
        'origin': origin, 'destination': dest, 'date': date,
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


def fmt(f):
    legs = f['legs']
    airlines = '/'.join(sorted({l['airline'] for l in legs}))
    flights = '+'.join(l['flightNumber'] for l in legs)
    dep = legs[0]['departure'][11:16]
    arr = legs[-1]['arrival'][11:16]
    stops = f['stops']
    slabel = 'NS' if stops == 0 else f"{stops}st"
    layovers = ''
    if len(legs) > 1:
        connections = [l['from'].split(',')[0][:3].upper() for l in legs[:-1]]
        layovers = ' via ' + '/'.join(c for c in connections)
    return {
        'price': int(f['price']),
        'airline': airlines,
        'dep': dep,
        'arr': arr,
        'dur': f['durationFormatted'],
        'stops': slabel,
        'flights': flights,
        'layovers': layovers,
    }


def collect(origin, dest, date, want_top=20):
    """Collect a diverse set: nonstops + a spread of 1-stops at different times/prices."""
    seen = set()
    out = []
    
    # Nonstops first
    r = search(origin, dest, date, stops='NON_STOP', sort='BEST')
    if 'error' not in r:
        for f in r.get('flights', [])[:8]:
            key = (f['legs'][0]['flightNumber'], f['legs'][0]['departure'])
            if key not in seen:
                seen.add(key)
                out.append({'category': 'nonstop', **fmt(f)})
    
    # Cheapest with stops
    r = search(origin, dest, date, sort='CHEAPEST')
    if 'error' not in r:
        for f in r.get('flights', [])[:15]:
            key = (f['legs'][0]['flightNumber'], f['legs'][0]['departure'])
            if key not in seen:
                seen.add(key)
                out.append({'category': '1stop', **fmt(f)})
    
    return out


outbound = collect('STL', 'JAX', '2026-07-15')
returning = collect('JAX', 'STL', '2026-07-18')

print('=== OUTBOUND (STL -> JAX, Wed Jul 15) ===')
print(json.dumps(outbound, indent=2))
print()
print('=== RETURN (JAX -> STL, Sat Jul 18) ===')
print(json.dumps(returning, indent=2))
