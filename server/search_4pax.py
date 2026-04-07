"""Deep sweep: all nonstop BOS flights for 2 adults + 2 children."""
import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

def search_oneway(origin, dest, date):
    body = json.dumps({
        'origin': origin, 'destination': dest,
        'date': date,
        'adults': 2, 'children': 2,
        'cabin': 'ECONOMY', 'stops': 'ANY', 'sort': 'BEST'
    }).encode()
    req = urllib.request.Request(
        'http://127.0.0.1:4001/api/flights/search',
        data=body, headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            return json.loads(r.read())
    except Exception as e:
        return {'error': str(e)}


def print_nonstops(date, result):
    if 'error' in result:
        print(f"  {date}: ERROR {result['error']}")
        return
    flights = result.get('flights', [])
    # Filter to TRUE nonstops only (stops==0 AND single leg)
    nonstops = [f for f in flights if f['stops'] == 0 and len(f['legs']) == 1]
    print(f"\n  {date} — {len(nonstops)} nonstop(s)")
    for i, f in enumerate(nonstops[:8]):
        leg = f['legs'][0]
        airline = leg['airline']
        dep = leg['departure'][11:16]
        arr = leg['arrival'][11:16]
        price = int(f['price'])
        dur = f['durationFormatted']
        print(f"    ${price:>5}  {airline:<4} {dep} -> {arr}  {dur}")


print("=" * 60)
print("OUTBOUND: STL -> BOS  (2 adults + 2 children)")
print("=" * 60)
for d in ['2026-06-28', '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03']:
    result = search_oneway('STL', 'BOS', d)
    print_nonstops(d, result)

print("\n" + "=" * 60)
print("RETURN: BOS -> STL  (2 adults + 2 children)")
print("=" * 60)
for d in ['2026-07-05', '2026-07-06', '2026-07-07', '2026-07-08', '2026-07-09']:
    result = search_oneway('BOS', 'STL', d)
    print_nonstops(d, result)
