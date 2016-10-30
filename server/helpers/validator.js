//PATH HELPER
module.exports = function(_config){

	var _validateCommentSubmit = function(commentComponents){
		var errs = [];

		if(typeof commentComponents.post_id !== "string"){
			errs.push("The post id is not valid.");
		}

		if( typeof commentComponents.name !== "string" || commentComponents.name.length < 3 ) {
			errs.push("The name is not provided or it's too short");
		}

		if( typeof commentComponents.body !== 'string' || commentComponents.body.length < 5 ) {
			errs.push("The comment body is way too short");
		}

		if( typeof  commentComponents.answer_to !== "string" ) {
			errs.push('The <answer to> field is not a string');
		}

		if( isNaN(commentComponents.timestamp) ) {
			errs.push('The timestamp component is not a number');
		}

		return errs;
	};


	var _validateMessageSubmit = function(messageComponents){
		var errs = [];


		if( typeof messageComponents.name !== "string" || messageComponents.name.length < 3 ) {
			errs.push("The name is not provided or it's too short");
		}

		if( typeof messageComponents.body !== 'string' || messageComponents.body.length < 5 ) {
			errs.push("The comment body is way too short");
		}

		var re = /\S+@\S+\.\S+/;
		if( typeof  messageComponents.email !== "string" && !re.test( state.email ) ) {
			errs.push('The email was not provided or not valid');
		}

		if( isNaN(messageComponents.timestamp) ) {
			errs.push('The timestamp component is not a number');
		}

		return errs;
	}


	return {
		validateCommentSubmit : _validateCommentSubmit,
		validateMessageSubmit : _validateMessageSubmit
	};
};
