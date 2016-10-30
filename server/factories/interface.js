
module.exports = function(CORE){
	//factory for Interface
	return function(){

		var _views = {};

		var _addView = function( view_name, handler ){

			if( typeof view_name !== "string" ){
				console.error(Error( "The view could not be added. The view name must be a string! " ));
			}

			if( typeof handler !== "function" ){
				console.error(Error( "The handler for a view must be a function!" ));
			}

			_views[view_name] = {
				name: view_name,
				handler : handler
			};
		};



		var _renderView = function( view_name, data ){

			if( typeof _views[view_name] !== "object" ) {
				console.error(Error("The view: '" + view_name + "' could not be rendered. The view is missing from the interface"));
			}

			if( typeof _views[view_name].handler !== "function" ) {
				console.error(Error("The view: '" + view_name + "' does not have a defined handler."));
			}

			return _views[view_name].handler( data );
		};

		var _to = function(interface_name){

			if(interface_name == "default"){
				return CORE.interfaces[ CORE.config.default_interface ];
			} else {
				var requested_interface = CORE.interfaces[ interface_name ];

				if( "undefined" !== typeof requested_interface ){
					return requested_interface;
				} else {

					console.error(Error("The requested interface: " + interface_name + " is not available"));
					return CORE.interfaces[ CORE.config.default_interface ];
				}
			}
		}


		return {
			view 	: _addView,
			render 	: _renderView,
			to		:_to
		};
	};
};
