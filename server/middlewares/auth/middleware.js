var Promise = require('bluebird');
var jwt = require('jwt-simple');


module.exports = function(CORE){


	var repo = CORE.repos.mongodb;

	//todo: LOGIN, logout,

	var _validateLogin =  function (email, password){
		return new Promise(function(resolve, reject){
			
			repo.find('users', {email: email, password: password})
			.done(function(find_result){

				if( find_result.length == 0 ){
					resolve({
						valid: false
					});
				} else {
					resolve({
						valid: true,
						user: find_result.shift()
					});
				}
			});

		});
	};

	var _getDefaultLoginJWT = function(user){
		return jwt.encode({
			email	: user.email,
			keys	: user.access_keys
		},  CORE.config.secrets.jwt );
	};

	var _checkKeys = function(sockets){


		return (sockets.indexOf("PUBLIC") != -1) ||
			( this.token &&
			sockets.reduce(function(crt_socket, acc){
				return acc || (this.token.keys.indexOf(crt_socket) != -1);
			},false));
	};

	return function (req, res, next) {

	   req.auth = {
		   token 				: req.cookies.jwt ? jwt.decode(req.cookies.jwt, CORE.config.secrets.jwt) : false,
		   validateLogin 		: _validateLogin,
		   getDefaultLoginJWT 	: _getDefaultLoginJWT,
		   checkKeys 			: _checkKeys
	   };

	   next();
   };

};
