
module.exports = function(CORE){

	var repo = CORE.repos.mongodb; //the name of the folder
	


	var _countDocumentsInCollection= function(collection) {
		return repo.count(collection, {});
	};


	var _insertDocuments = function(collection, documents) {
		return repo.insert(collection, documents);
	};


	var _find = function(collection, query, projection, opts) {
		return repo.find( collection, query, projection, opts );
	};


	var _removeCollection = function(collection, query){
		return repo.delete(collection, query);
	};



	return function (req, res, next) {

		req.model = {
			countDocumentsInCollection 	: _countDocumentsInCollection,
			insertDocuments 			: _insertDocuments,
			find						: _find,
			removeCollection			: _removeCollection
		}

		next();
	};
};
