# conn is a psycopg2 connection

import psycopg2
import bs4

conn = psycopg2.connect(database="routes", user="maxroach", host="localhost", port=26257)
conn.set_session(autocommit=True)
cur = conn.cursor()

with open('index.html') as inf:
    txt = inf.read()
    soup = bs4.BeautifulSoup(txt, 'html.parser')

modal = soup.find(id='modal-body')

inner = '<table id="classTable" class="table table-bordered">\n<thead>\n</thead>\n<tbody>\n'

with conn.cursor() as cur:
    cur.execute("SELECT hull_data->'hull_names',sentiment FROM route_data;")
    rows = cur.fetchall()
    for row in rows:
        inner += '<tr>\n'
        for cell in row:
            inner += '<td>'+str(cell)+'</td>\n'
        inner += '</tr>\n'

inner += '</tbody>\n</table>'

print(inner)