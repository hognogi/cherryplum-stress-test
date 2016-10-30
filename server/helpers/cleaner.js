
var sanitizeHtml = require('sanitize-html');




module.exports = function(_config){

	var _cleanCommentSubmit = function(commentComponents){

		return {
			post_id  	: commentComponents.post_id,
			name	 	: sanitizeHtml(commentComponents.name),
			body	 	: sanitizeHtml(commentComponents.body),
			answer_to 	: commentComponents.answer_to,
			timestamp	: commentComponents.timestamp
		};
	};


	var _cleanMessageSubmit = function(messageCompoenents) {
		return {
			name	 	: sanitizeHtml(messageCompoenents.name),
			body	 	: sanitizeHtml(messageCompoenents.body),
			email	 	: sanitizeHtml(messageCompoenents.email),
			timestamp	: messageCompoenents.timestamp
		};
	}

	var _cleanString  = function(string) {
		return sanitizeHtml( string );
	};



	return {
			cleanCommentSubmit 	: _cleanCommentSubmit,
			cleanString			: _cleanString,
			cleanMessageSubmit 	: _cleanMessageSubmit 
	};
};
