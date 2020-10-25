var async = require('async');
var fs = require('fs');
var pg = require('pg');

// Connect to the "bank" database.
var config = {
    user: 'maxroach',
    host: 'localhost',
    database: 'routes',
    port: 26257
};

function writeJSON(direction_service, hull_data, sentiment) {
	// Create a pool.
	var pool = new pg.Pool(config);

	pool.connect(function (err, client, done) {

	    // Close communication with the database and exit.
	    var finish = function () {
		done();
		process.exit();
	    };

	    if (err) {
		console.error('could not connect to cockroachdb', err);
		finish();
	    }
	    async.waterfall([
		    function (next) {
			// Create the 'accounts' table.
			client.query('CREATE TABLE IF NOT EXISTS route_data (route_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), last_updated TIMESTAMP DEFAULT now(), direction_service JSONB, hull_data JSONB, sentiment FLOAT);', next);
			// console.log('Created route_data table.');
		    },
		    function (results, next) {
			client.query('SHOW COLUMNS FROM route_data;', next);	
		    },
		    function (results, next) {
			// console.log('INSERT INTO route_data (direction_service) VALUES (\''+JSON.stringify(direction_service)+'\');');
			// client.query('INSERT INTO route_data (direction_service) VALUES (\''+JSON.stringify(direction_service)+'\');', next);
			// console.log('INSERT INTO route_data (direction_service, hull_data, sentiment) VALUES (\''+JSON.stringify(direction_service)+'\', \''+JSON.stringify(hull_data)+'\','+sentiment+');');
			client.query('INSERT INTO route_data (direction_service, hull_data, sentiment) VALUES (\''+JSON.stringify(direction_service)+'\', \''+JSON.stringify(hull_data)+'\','+sentiment+');', next);
		    },
		    function (results, next) {
			// console.log('test')
			client.query('SELECT route_id, direction_service FROM route_data;', next);
		    }
		],
		function (err, results) {
		    if (err) {
			console.error('Error inserting into and selecting from route_data: ', err);
			finish();
		    }

		    console.log('Current data:');
		    results.rows.forEach(function (row) {
			console.log(row);
		    });

		    finish();
		});
	});
	console.log('test2');
}

writeJSON({test: 1}, {test: 2}, 331);
writeJSON({test: 10}, {test: 42}, 34);
writeJSON({test: 0010}, {test: 32}, 33);
writeJSON({test: 1000}, {test: 12}, 23);
