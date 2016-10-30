

$(function(){
	var _isTestRunning = false,

		_requestsSentSoFar = 0,
		_requestsReceivedSoFar = 0,
		_documentsInsertedSoFar = 0,
		_documentsRetrievedSoFar = 0,
		_cumulativeTimeForRequests = 0,
		_cumulativeTimeForDocumentsInserted = 0,
		_cumulativeTimeForDocumentsRetrieved = 0,

		_ajaxConfigObjects = [],
		
		
		_maxAmountOfRequests = 0,
		_documentsInsertedPer100Requests = 0,
		_documentsRetrievedPer100Requests = 0,
		
		_ajaxIntervalMs = 0,
		_ajaxIntervalId = 0,
		_ajaxIndex = 0;




	function resetVariables(){
		_requestsSentSoFar = 0,
		_requestsReceivedSoFar = 0,
		_documentsInsertedSoFar = 0,
		_documentsRetrievedSoFar = 0,
		_cumulativeTimeForRequests = 0,
		_cumulativeTimeForDocumentsInserted = 0,
		_cumulativeTimeForDocumentsRetrieved = 0,

		_documentsInsertedPer100Requests = 0,
		_documentsRetrievedPer100Requests = 0,

		_ajaxConfigObjects = [],
		
		_ajaxInterval = 0;
		clearInterval(_ajaxIntervalId);	
		_ajaxIndex = 0;
	};



	function createAjaxConfigObjects(){

		 _maxAmountOfRequests = $('#ajax-requets-amount').val();
		 _documentsInsertedPer100Requests = $('#documents-inserted-per-100-requests').val();
		 _documentsRetrievedPer100Requests = $('#documents-retrieved-per-100-requests').val();

		 for( var i= 0; i < _maxAmountOfRequests ; i++ ){

			 _ajaxConfigObjects.push(
				 {
					url: "/stress_test",
					data: { 
						request_index : i,
						DIp100req: _documentsInsertedPer100Requests,
						DRp100req: _documentsRetrievedPer100Requests
					}
				}
			);
		 }

	};


	function stopTest(){

		$('#start_stop_test').text('Start new Test');
		$('#start_stop_test').removeClass('btn-danger').addClass('btn-primary');

		clearInterval(_ajaxIntervalId);
		_isTestRunning = false;
	};


	function startAjaxCalls(){	
		_ajaxIntervalMs =  parseInt( $('#ajax-requets-interval').val() );


		_ajaxIntervalId = setInterval(function(){

			if ( _ajaxIndex == _maxAmountOfRequests ) {
				stopTest();

				return;
			}

			var ajaxObject = _ajaxConfigObjects[_ajaxIndex++]; 
			
			ajaxObject.sentRequest = true;
			ajaxObject.sentTimestamp = Date.now();
			_requestsSentSoFar ++;

			
			$.ajax( ajaxObject ).done(function(result){
				
				if( result.status == 'success' ) {

					_documentsInsertedSoFar += result.payload.documentsInserted;
					_documentsRetrievedSoFar += result.payload.documentsRetrieved;
					_cumulativeTimeForDocumentsInserted += result.payload.timePerDocumentsInserted;
					_cumulativeTimeForDocumentsRetrieved += result.payload.timePerDocumentsRetrieved;

				} else {
					console.err(result.payload);
				}

			}).fail( function(err){
				console.log('failed', err, this);
			}).always(function(){

				_requestsReceivedSoFar++;
				this.requestRecieved = true;

				var requestDuration = Date.now() - this.sentTimestamp;
				_cumulativeTimeForRequests += requestDuration;

				updateView();
			});
			
		},_ajaxIntervalMs);
	};


	function updateView(){

		var averageTimePerRequest = _cumulativeTimeForRequests/_requestsReceivedSoFar,
			averageTimePerDocumentInserted = _cumulativeTimeForDocumentsInserted/_documentsInsertedSoFar,
			averageTimePerDocumentRetrieved = _cumulativeTimeForDocumentsRetrieved / _documentsRetrievedSoFar;

		$('#requests-sent-screen').html(_requestsSentSoFar);
		$('#requests-recieved-screen').html(_requestsReceivedSoFar);
		$('#documents-inserted-screen').html(_documentsInsertedSoFar);
		$('#documnets-recieved-screen').html(_documentsRetrievedSoFar);

		$('#request-average-time-screen').html(averageTimePerRequest);
		$('#insert-average-time-screen').html(averageTimePerDocumentInserted);
		$('#retrieve-average-time-screen').html(averageTimePerDocumentRetrieved);
	};


	function startTest(){
		resetVariables();
		createAjaxConfigObjects();
		startAjaxCalls();
	};





	$('#start_stop_test').on('click', function(){

		if( _isTestRunning == false ) {

			$(this).text('Stop Test');
			$(this).removeClass('btn-primary').addClass('btn-danger');

			_isTestRunning = true;
			startTest();
		} else {

			stopTest();

		}
	});



	$('#check_number_of_documents').on('click', function(){

		$.ajax({
			url: '/check_number_of_docs'
		}).done( function(responseObject){

			if ( responseObject.status == "success" ) {
				$('#number_of_docs_screen').html(responseObject.payload);
			} else {
				console.warn('something went wrong when checking number of docs');
				console.log(responseObject);
			}
				
		})
		
		.fail(function(err){
			console.warn('checking for documents failed.');
			console.error(err);
		});

	});

	$('#cleanup_test_collection').on('click', function(){

		$.ajax({
			url: '/cleanup_test_collection'
		}).done( function(responseObject){

			if ( responseObject.status == "success" ) {
				$('#number_of_docs_screen').html(0);
			} else {
				console.warn('something went wrong when cleaning docs');
				console.log(responseObject);
			}
				
		})
		
		.fail(function(err){
			console.warn('cleaning collection of documents failed.');
			console.error(err);
		});

	});



});



