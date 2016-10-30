extend = require('extend')

module.exports = function(CORE){
	//factory for Interface
	var _default_config = {
		access : {
			sockets: ["ADMIN", "REGISTERED","PUBLIC"],
			interfaces: ["web","admin"]
		},
		method: 'GET',
		path: '/default_route',
		handler:  function (req, res) {
			res.send('<h3>This is the default route. This should have been handled. Some route does not have the "path" attribute set.</h3>' );
		},
		access_violation : function(req, res){
			res.send( "Access violation" );
		}
	}


	var _proto_handler = function(req, res, next){

		if( req.auth.checkKeys(this.access.sockets) && req.interface.checkAccess( this.access.interfaces ) ){
			this.handler( req, res, next );
		} else {
			this.access_violation(req, res, next);
		}
	}



	return function(config){
		return _proto_handler.bind(extend(true, {}, _default_config, config  ));
	};
};
