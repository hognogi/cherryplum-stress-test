var fs = require('fs');

//CORE OBJECT
module.exports = function(_config){

	//initialize core object
	var CORE = {
		config: _config
	};



	var _getHelpers = function(){

		var helper_files =  fs.readdirSync( _config.directories.helpers ),
			helpers = {},
			helper_instance, i, helper_name;

		for( i = 0; i < helper_files.length; i++ ){

			//initialize helper
			helper_instance = require(  _config.root_path_relative_to_core + _config.directories.helpers + "/" + helper_files[i]  )(_config);

			helper_name = helper_files[i].substr(0, helper_files[i].lastIndexOf('.'));  //remove ".js" from file name
			helpers[helper_name] = helper_instance;
		};

		return helpers;
	};




	var _getFactories = function(){

		var factories_files = fs.readdirSync( _config.directories.factories ),
			factories = {},
			factory_function, i, factory_name;

		for( i = 0; i < factories_files.length; i++ ){

			//initialize factory function
			factory_function = require(  _config.root_path_relative_to_core +  _config.directories.factories + "/" + factories_files[i] )(CORE);

			factory_name = factories_files[i].substr(0, factories_files[i].lastIndexOf('.')); //remove ".js" from file name
			factories[factory_name] = factory_function;
		};

		return factories;
	};



	var _getInterfaces = function(){

		var interface_directories = fs.readdirSync( _config.directories.interfaces ),
			interfaces = {},
			interface_name,interface_instance,i;

		for( i = 0; i < interface_directories.length; i++ ){


			//initialize interface
			interface_instance = require( _config.root_path_relative_to_core + _config.directories.interfaces + "/" + interface_directories[i] + "/interface.js"  )(CORE);

			interface_name = interface_directories[i];
			interface_instance.__interface_name = interface_name;

			interfaces[ interface_name ] = interface_instance;
		};

		return interfaces;
	};




	var _getMiddlewares = function(){

		var middleware_directories = fs.readdirSync( _config.directories.middlewares ),
			middlewares = {},
			middleware_function,middleware_name,i;

		for( i = 0; i < middleware_directories.length; i++ ){

			//initialize middleware
			middleware_function = require(  _config.root_path_relative_to_core  + _config.directories.middlewares + "/" + middleware_directories[i] + "/middleware.js"  )(CORE);

			middleware_name = middleware_directories[i];
			middlewares[middleware_name] = middleware_function;
		};

		return middlewares;
	};


	var _getRepositories = function(){

		var repo_directories = fs.readdirSync( _config.directories.repositories ),
			repos = {},
			repo_instance, repo_name, i;

		for( i = 0; i < repo_directories.length; i++ ){

			//initialize repo
			repo_instance = require( _config.root_path_relative_to_core  + _config.directories.repositories + "/" + repo_directories[i] + "/repository.js" )(CORE);

			repo_name = repo_directories[i];
			repos[ repo_name ] = repo_instance;
		}

		return repos;
	};



	CORE.router = function(_app){

		var route_directories = fs.readdirSync( _config.directories.routes ),
			i, j;

		for( i = 0; i < route_directories.length; i++ ){

			var _crt_dir = route_directories[i];
			var routes_arr = require( _config.root_path_relative_to_core +  _config.directories.routes + "/"  + _crt_dir  + "/route.js" );


			for( j = 0; j < routes_arr.length; j++ ){

				var _method 	= routes_arr[j].method.toLowerCase();
				var _path 		= routes_arr[j].path;
				var _handler 	= CORE.factories.route_handler(routes_arr[j]);


				console.log('setting path: ',_method, _path);

				_app[_method](_path, _handler);
			}


		}

	
		console.log('set 404');

		//404 override
		_app.use(function(req, res){
			res.send('404');
			//res.send( req.interface.to("default").render("404" ) );
		});
	};



	CORE.cleanup = function(){


		console.log("CLEANUP!");

		//CORE.repos.mongodb.cleanup();

	};



	CORE.helpers 		= _getHelpers();
	CORE.factories		= _getFactories();
	CORE.interfaces		= _getInterfaces();
	CORE.repos 			= _getRepositories();
	CORE.middlewares	= _getMiddlewares();

	return CORE;
};
