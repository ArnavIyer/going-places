import json
import psycopg2
import requests
import time

conn = psycopg2.connect(database="routes", user="maxroach", host="localhost", port=26257)
conn.set_session(autocommit=True)
cur = conn.cursor()

with open('json.json') as f:
  data = json.load(f)

# Insert data into db
cur.execute("""INSERT INTO routes.route_data (direction_service, hull_data, sentiment) VALUES (%s,%s,%s)""", (json.dumps(data["direction_service"]), json.dumps(data["hull_data"]), data["sentiment"]))
