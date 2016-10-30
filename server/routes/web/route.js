

var randomObject = require('../../external/random-object.js');
var Promise = require('bluebird');


module.exports = [

	/**
	*	Admin and web GET homepage
	*/
	{
		method: 'GET',
		path: '/',
		handler :  function (req, res) {
			res.send(  req.interface.render('stress_test'));
		}
	},

	{
		method: 'GET',
		path: '/cleanup_test_collection',
		handler: function(req, res){

			req.model.removeCollection('test_collection', {}).then(function(){
				res.send({
					status: 'success'
				});
			}, function(err){
				res.send({
					status: 'error'
				});
			})

		}
	},


	{
		method: 'GET',
		path: '/check_number_of_docs',
		handler: function(req, res){

			req.model.countDocumentsInCollection('test_collection').then(function(countResult){
				res.send({
					status: 'success',
					payload: countResult
				});
			}, function(err){
				res.send({
					status: 'error',
					payload: err
				});
			})

		}
	},
	{
		method: 'GET',
		path: '/stress_test',
		handler: function(req, res) {

			var responsePayload = {};

			//documents inserted per 100 requests
			var DIp100req = parseInt(req.query.DIp100req);
			//documents retrieved per 100 requests
			var DRp100req = parseInt(req.query.DRp100req);


			var nrOfDocumentsInserted =  parseInt( DIp100req/100 ) + (  Math.random()*100 <= ( DIp100req%100 ) ? 1: 0 );

			var nrOfDocumentsRetrieved =   parseInt( DRp100req/100 ) + (  Math.random()*100 <= ( DRp100req%100 ) ? 1: 0 );

			var listOfDocumentsToInsert = Array(10).fill(0).map(function(){
				return randomObject(Math.floor( Math.random() * 10 ) , false);
			});

			var preInsertStamp = Date.now(), preRetrieveStamp;

			var insertDocumentsPromise = listOfDocumentsToInsert.length > 0 ? 
											req.model.insertDocuments('test_collection', listOfDocumentsToInsert) :
											Promise.resolve("");



			insertDocumentsPromise.then(function(){
				responsePayload.documentsInserted = nrOfDocumentsInserted;
				responsePayload.timePerDocumentsInserted = Date.now() - preInsertStamp;


				preRetrieveStamp = Date.now();

			})

			.then(function(){
				return req.model.countDocumentsInCollection('test_collection')
			})

			.then(function(documentCount){

				if( nrOfDocumentsRetrieved > 0 ) {
					return req.model.find('test_collection', {},{}, {
						limit: nrOfDocumentsRetrieved,
						skip:  documentCount - nrOfDocumentsRetrieved
					})
				} else {
					return Promise.resolve(true);
				}

			})

			.then(function(){
				responsePayload.documentsRetrieved = nrOfDocumentsRetrieved;
				responsePayload.timePerDocumentsRetrieved = Date.now() - preRetrieveStamp;

					
				res.send({
					status: 'success',
					payload: responsePayload
				});

			})

			.catch(function(err){
				console.log('something horrible happened');
				console.error(err);
			});

		}
	}
];
