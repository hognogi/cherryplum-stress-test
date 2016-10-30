/**
	To create a view with DoT.js:

	Values that are marked like <this> need to be replaced with appropriate values.


	admin_intf.view('<view name>', function(data){

			//DO any computation on the data, if necessary (most likely not necessary)


		return admin_intf.dots.<view file>({
			fragments: admin_intf.fragments, //this variable is accesible inside the view file using "it.fragments" and it's used to insert the header and the footer in the view
			<view param> : data.<view param> //this will be accesible inside the view using it.<view param>
		});
	});


*/

module.exports = function(CORE, interface_name){

	var web_intf = CORE.factories.interface();


	var doT = require("dot");
	web_intf.dots = doT.process({path: "./client/interfaces/web/views"});

	web_intf.view('stress_test', function(data){

		return web_intf.dots.stress_test({});
	});

	return web_intf;
};
