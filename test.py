import json
import psycopg2
import requests
import time

conn = psycopg2.connect(database="routes", user="maxroach", host="localhost", port=26257)
conn.set_session(autocommit=True)
cur = conn.cursor()

for n in range(41):
    # cur.execute("""INSERT INTO jsonb_test.programming (posts)
    #         SELECT json_array_elements(%s->'data'->'children')""", (data,))

    cur.execute("""INSERT INTO routes.route_data (direction_service, hull_data, sentiment) VALUES (%s,%s,%s)""", (json.dumps({"x":4}), json.dumps({"x":4}), 3))

    # Reddit limits to 30 requests per minute, so don't do any more than that.
    time.sleep(2)

cur.close()
conn.close()

