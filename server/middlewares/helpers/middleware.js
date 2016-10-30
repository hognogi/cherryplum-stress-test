module.exports = function(CORE){
	return function (req, res, next) {
		req.helpers = CORE.helpers;
		next();
	};
};
