//SEE MAIN FLOW AT THE END OF THE FILE


var mongoClient = require('mongodb').MongoClient,
	collection = require('mongodb').Collection,
	Promise = require('bluebird'),
	extend = require('extend'),
	rl = require('readline'),
	fs = require('fs'),
	
	_db,_config;


var initializeDatabase = function(){

	return Promise.all([
		_db.collection("general").removeAsync(),
		_db.collection("media").removeAsync(),
		_db.collection("messages").removeAsync(),
		_db.collection("notifications").removeAsync(),
		_db.collection("posts").removeAsync(),
		_db.collection("users").removeAsync()
	])
	.then(function(removeReports){
		console.log("=====Remove Report==========");
		console.log(removeReports.map(function(report){
			return report.result;
		}));
		console.log("============================");
		console.log("\n\n\nCreating collections\n\n");

		return new Promise(function(resolve, reject){
			_db.createCollection("test_collection", function(){
				resolve();
			});	
		});
	})




	.then(function(){
		console.log('collection: test_collection created successfuly');

		console.log('closing the database');
		_db.close();

	});
};




/**
 * USER INTERACTION SECTION
 */
var prompts = rl.createInterface(process.stdin, process.stdout);
var required_env_var_names = [
	'CHERRYPLUM_NODEJS_PORT',
	'CHERRYPLUM_NODEJS_IP',
	'CHERRYPLUM_MONGODB_DB_URL',
	'CHERRYPLUM_BLOG_JWT_SECRET',
	'CHERRYPLUM_MONGODB_DB_NAME'
], 
	required_env_vars;


var dotenv = require('dotenv');
dotenv.config();



/**
 * Get user input from stdin
 */
var getUserInput = function(prompt_message){
	return new Promise(function(resolve, reject){
		prompts.question(prompt_message, function(answer){
			resolve(answer);
		});	
	});
};


/**
 * Should a specific environment variable update or not
 */
var setUpdateFlag = function (env_var) {

	return new Promise(function(resolve, reject){
		getUserInput(env_var + " is already set. Do you want to update it? (y/n):")
		
		.then(function(userInput){
			if( userInput == "y") {
				console.log("you set " + env_var + " should update\n\n");
				required_env_vars[env_var].shouldUpdate = true;
				resolve('updated:' + env_var);
			} else {
				console.log("you set " + env_var + " should not update\n\n");
				resolve('updated:' + env_var);
			}
		});
	});
};


/**
 * Prompt the user to set a specific environment variable
 */
var updateEnvVar = function(env_var) {

	return new Promise(function(resolve, reject){


		getUserInput("set " + env_var + ":")

		.then(function(userInput){
			required_env_vars[env_var].updateValue = userInput;

			resolve();
		});

	});

};



/**
 * required_env_vars : an object, each key is a var name, and the value is a flags object
 */
required_env_vars = required_env_var_names.reduce(function(acc, crt){


	if ( process.env[crt] ) {
		acc[crt] = {
			isInEnv : true,
			shouldUpdate : false,
			updateValue : process.env[crt] //we will actually update the variable in the .env file with the same value
		};
	} else {
		acc[crt] = {
			isInEnv : false,
			shouldUpdate : true,
			updateValue : ""
		};
	}
	return acc;
},{});




/**
 * Compile first an array of tasks (functions that return a promise) 
 * Execute the promises one by one, so we can read user input logically
 */
var promptUserForEnvUpdate = function ( ) {
	var prompt_update_promises =  required_env_var_names.reduce(function(acc, crt){

		if ( required_env_vars[crt].isInEnv ) {

			acc.push( function(var_name){
				return setUpdateFlag(var_name);
			});
		}

		return acc;

	}, []);

	if( prompt_update_promises.length > 0 ) {

		return Promise.reduce( prompt_update_promises, function(var_names, task, index){
			return task( required_env_var_names[index] );
		}, null)

	}  else {
		return Promise.resolve();
	}

};




/**
 * Compile first an array of tasks (functions that return a promise) 
 * Execute the promises one by one, so we can read user input logically
 */
var promptUserForEnvVars = function() {

	var update_var_names = [];
	var update_vars_promises = required_env_var_names.reduce(function(acc, crt){

		if ( required_env_vars[crt].shouldUpdate ) {
			update_var_names.push(crt);
			acc.push( function(var_name){
				return updateEnvVar(var_name);
			});
		}
		return acc;

	}, []);

	if( update_vars_promises.length > 0 ) {
		//chain an array of promises. (takes an array of functions that return a promise as argument)
		return Promise.reduce( update_vars_promises, function(var_names, task, index){
			return task( update_var_names[index] );
		}, null)
	} else {
		return Promise.resolve();
	}
};


/**
 * read the updated values provided by the user with the command line and write the ".env" file
 * update the process.env object, to contain the latest values
 */
var updateEnv = function(){

	return new Promise(function(resolve, reject){
		var dot_env_content = "";
		for ( env_var in required_env_vars ) {
			dot_env_content += env_var + "=" + required_env_vars[env_var].updateValue + "\n";
		};
		fs.writeFile(".env", dot_env_content, function(err) {
			if(err) {
				console.log('\n\n!!!Writing .env file failed; Write content:\n\n', dot_env_content);
				resolve();
				return;
			}
			//extend the process.env since dotenv does not allow reload :( 
			extend(process.env,  dotenv.parse(dot_env_content));
			console.log(".env file was updated");
			resolve();
		});
	});
};



/**
 * !!! this will remove the collections and create new empty collections 
 * the admin user will be added (the user properties will be read from the process.env object)
 * the settings object will be added in the general collection
 */
var updateDatabase = function(){

	return new Promise(function(resolve, reject){

		Promise.promisifyAll(collection.prototype);
		Promise.promisifyAll(mongoClient);

		collection.prototype._find = collection.prototype.find;
		collection.prototype.find = function() {
			var cursor = this._find.apply(this, arguments);
			cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
			cursor.countAsync = Promise.promisify(cursor.count, cursor);
			return cursor;
		};

		mongoClient.connectAsync( _config.mongodb_url +"/" + _config.mongodb_db_name )
			.then(function(db){
				_db = db;
				console.log('\n\nThe app was connected to the database\n\n');

				initializeDatabase()

				.done(function(){
					resolve();
				})

			}).catch(function(err){
				console.log('\n\n!!!Could not connect to the database\n\n');
				reject();
			});

	});
	
};






/**
 * Prompt the user if he wants to update the database. !!!! if the user will input "y" the database will be RESET
 */
var promptUserForDatabaseUpdate = function(){
	return new Promise(function(resolve, reject){
		_config = require('./config.js');

		getUserInput("\n\nDo you want to initialize the database named '"+ _config.mongodb_db_name +"' (y/n):")
		.then(function(userInput){
			
			if (userInput == "y" ) {
				updateDatabase()
				.then(function(){
					resolve();
				});
			} else {
				console.log('\n\nSkipping database initialization\n\n');
				resolve()
			}
		});
	});
};






//MAIN FLOW

promptUserForEnvUpdate()
.then(function(promptForUpdateResult){
	return promptUserForEnvVars()
})
.then(function(res){
	console.log('\n\nUpdating the .env file..');
	return updateEnv();
})
.then(function(res){
	return promptUserForDatabaseUpdate();
})
.then(function(){
	console.log('\n\n\nAll should be done. You should be able to start your app now.');
	process.exit();
})
.catch(function(){
	process.exit();
	console.log('\n\n\nSomething went wrong. Please check the .env file (or environment variables) and the database, and re-run the setup.');
});







