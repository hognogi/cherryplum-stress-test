//UTILS HELPER
module.exports = function(_config){

	


	var _splitAndTrim = function(input, separator){

		return input.split(separator).map(function(item){
			return item.trim();
		});
	};

	var _removeEmptyStringsArray = function(arr){

		return arr.reduce( function(acc, crt){
			crt !== "" && acc.push(crt);
			return acc;
		}, [] );
	};

	var _flatArray = function(arrays){

		return arrays.reduce(function(acc, crt){

			if (Array.isArray(crt)){
				return acc.concat(_flatArray(crt));
			} else {
				acc.push(crt);
				return acc;
			}
		},[])
	};

	var _rmDuplicates = function(array){

		return array.reduce( function(acc, crt){
			if (acc.indexOf(crt) == -1){
				acc.push(crt);
			}
			return acc;
		}, [] );
	};



	return {
		splitAndTrim			: _splitAndTrim,
		flatArray 				: _flatArray,
		uniqueArray 			: _rmDuplicates,
		removeEmptyStringsArray	: _removeEmptyStringsArray
	};
};
