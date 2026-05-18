"""Search Portland ME flights for NH trip."""
import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

def search_oneway(origin, dest, date):
    body = json.dumps({
        'origin': origin, 'destination': dest,
        'date': date,
        'adults': 2, 'children': 1,
        'cabin': 'ECONOMY', 'stops': 'ANY', 'sort': 'BEST'
    }).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:4001/api/flights/search',
        data=body, headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except Exception as e:
        return {'error': str(e)}

def print_results(origin, dest, date, result):
    if 'error' in result:
        print(f"{origin}->{dest} {date}: ERROR {result['error']}")
        return
    flights = result.get('flights', [])
    print(f"\n=== {origin} -> {dest}  {date} === ({len(flights)} results)")
    for i, f in enumerate(flights[:8]):
        legs = f['legs']
        airlines = ','.join(l['airline'] for l in legs)
        dep = legs[0]['departure'][11:16]
        arr = legs[-1]['arrival'][11:16]
        stops = f['stops']
        slabel = 'nonstop' if stops == 0 else f"{stops} stop"
        price = int(f['price'])
        dur = f['durationFormatted']
        print(f"  {i+1}. ${price:>4}  {airlines:<12} {dep}->{arr}  {dur:>7}  {slabel}")

print("=" * 60)
print("OUTBOUND: STL -> PWM")
print("=" * 60)
for d in ['2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03']:
    result = search_oneway('STL', 'PWM', d)
    print_results('STL', 'PWM', d, result)

print("\n" + "=" * 60)
print("RETURN: PWM -> STL")
print("=" * 60)
for d in ['2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08']:
    result = search_oneway('PWM', 'STL', d)
    print_results('PWM', 'STL', d, result)
