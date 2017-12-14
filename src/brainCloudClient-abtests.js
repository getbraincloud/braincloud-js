/**
* @status complete
*/


function BCAbTest() {
    var bc = this;

	bc.abtests = {};

	bc.abtests.loadABTestData = function (dataUrl, callback) {
		console.log("called loadABTestData(" + dataUrl + ",callback)");

		// Retrieve AB Test data from AppServer S3 service.
		jQuery.ajax({
			timeout: 15000,
			url: dataUrl,
			type: "POST",
			contentType: "application/json",
			dataType: "json",
			data: JSON.stringify({})
		}).done(function (response) {
			// success...
			console.log("loadABTestData() - GOT: " + JSON.stringify(response));
			if (response != null) {
				abTestData = response;
			}
			if (callback) {
				callback();
			}
		}).fail(function (jqXhr, textStatus, errorThrown) {
			// failure...
			console.log("loadABTestData() - FAILED: " + jqXhr + " " + textStatus + " " + errorThrown);
		});
	};

	bc.abtests.getABTest = function (abTestingId, abTestName) {
		console.log("called getABTest(" + abTestingId + "," + abTestName + ").");
		// Process the AB Test data and determine if an active test exists that satisfies the supplied parameters.
		for (var x = 0; x < abTestData.ab_tests.length; x++) {
			if (abTestData.ab_tests[x].name == abTestName && abTestData.ab_tests[x].active == "true") {
				for (var y = 0; y < abTestData.ab_tests[x].data.length; y++) {
					// Check the ab_testing_id against the range defined in the test.
					var minId = abTestData.ab_tests[x].data[y].min;
					var maxId = abTestData.ab_tests[x].data[y].max;

					if (abTestingId >= minId && abTestingId <= maxId) {
						console.log("getABTest() - Found AB test '" + abTestName + ":" + abTestData.ab_tests[x].data[y].name + "' for abTestingId '" + abTestingId + "' in range '" + minId + "' to '" + maxId + "'.");
						return abTestData.ab_tests[x].data[y].name;
					}
				}
			}
		}
		console.log("getABTest() - Could not find an '" + abTestName + "' AB test for abTestingId '" + abTestingId + "'.");
		return null;
	};

	bc.abtests.pushABTestResult = function (abTestingId, abTestName, abSelection, result) {
		console.log("called pushABTestResult(" + abTestingId + "," + abTestName + "," + abSelection + "," + result + ").");
		/*
				// Push the AB Test result to MixPanel Analytics.
				mixpanel.track("ABTest", {
					'platform': 'javascript',
					'abTestingId': abTestingId,
					'abTestName': abTestName,
					'abSelection': abSelection,
					'result': result
				});*/
	};


	bc.abtests.setABTestingId = function (abTestingId) {
		bc.brainCloudManager.setABTestingId(abTestingId);
	};

	bc.abtests.getABTestingId = function () {
		return bc.brainCloudManager.getABTestingId();
	};

}

BCAbTest.apply(window.brainCloudClient = window.brainCloudClient || {});
