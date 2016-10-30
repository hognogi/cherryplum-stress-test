var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer  = require('multer');



//the value of "module.exports" is returned by the require function
module.exports = function(config){
	var _ctrl = {};

	var CORE = require('./core.js')(config);


	var _processEvents = function(){

		process.stdin.resume();//so the program will not close instantly

		function exitHandler(options, err) {

	        if (typeof options.sig === "string") {
	           console.log('%s: Received %s - terminating sample app ...',
	                       Date(Date.now()), options.sig);

	           CORE.cleanup();
	           process.exit(1);
	        }


			if (options.cleanup ){
				CORE.cleanup();
			}

			if (err) console.log(err.stack);

			if (options.exit){
				console.log("some kind of eunhandled exception :( ");
				process.exit();
			}

			console.log('%s: Node server stopped.', Date(Date.now()) );
		}

		//do something when app is closing
		process.on('exit', exitHandler.bind(null,{cleanup:true}));

		//catches uncaught exceptions
		process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

		// Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element,  exitHandler.bind(null,{sig:element}) );
        });
	};


	_ctrl.init = function(){

		_processEvents();

		_ctrl.app = express();


		// default middlewares


		_ctrl.app.use( bodyParser.json() );       // to support JSON-encoded bodies
		_ctrl.app.use( bodyParser.urlencoded({     // to support URL-encoded bodies
		  extended: true
		}));
		_ctrl.app.use(cookieParser());

		//we manually set each middleware because the order is very important

		_ctrl.app.use(CORE.middlewares.helpers);
		_ctrl.app.use(CORE.middlewares.model);
		_ctrl.app.use(CORE.middlewares.auth);
		_ctrl.app.use(CORE.middlewares.interface_ctrl);



		//init static files
		_ctrl.app.use("/res",express.static('./client/res/' ));


		//initialize router
		CORE.router(_ctrl.app);


		var _port 		= CORE.config.port || 2111;
		var _ipaddress 	= '127.0.0.1';

		if ( CORE.config.ipaddress ) {
			_ipaddress = CORE.config.ipaddress;
		} else {
			console.log('missing env variable: OPENSHIFT_NOEDJS_IP \nStarting the server on 127.0.0.1');
		}


		var server = _ctrl.app.listen( _port,_ipaddress, function () {
		  var host = server.address().address;
		  var port = server.address().port;

		  console.log('Example app listening at http://%s:%s', host, port);
		});

	};


	return _ctrl;
};
