console.log('Starting app.js... ');

var fs = require('fs');

try {
    fs.accessSync('.env', fs.F_OK);
	require('dotenv').config();
} catch (e) {
    // The .env file is not accessible, so we ignore it.
}


var config = require('./config.js');


var myapp = require('./server/server.js')(config);
myapp.init();
