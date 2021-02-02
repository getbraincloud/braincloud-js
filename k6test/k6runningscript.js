import crypto from 'k6/crypto';
import http from 'k6/http';
import { check,sleep } from 'k6';
import { Counter, Rate, Gauge, Trend } from "k6/metrics";
import * as Contact from "./alterbcconcat.js";

let counterErros = new Counter("c-errors");
let myrate = new Rate("new_rate");
let mytrends = new Trend("new_trend")

export let errorRate = new Rate("errors");
export let options = {
	stages: [
		{duration: "1m", target: 10},
		{duration: "20s", target: 30},
		{duration: "10s", target: 5},
	],
	thresholds:{
		"errors": ["rate<0.1"]
	}
};

export default function () {
    let res = http.get('https://portal.braincloudservers.com/login');
    console.log(res.status_text+JSON.stringify(res.headers));
    check(res, { 'status was 200': (r) => r.status == 200 }) || errorRate.add(1);
	sleep(1);
	
	let resloadgetbrain = http.get("https://getbraincloud.com/");
	let counterOK = resloadgetbrain.html("p").text().includes("brainCloud works so you can play.");

	if(!counterOK){
		counterErros.add(1);
	}


	myrate.add(3);
	myrate.add(9);
	mytrends.add(5);
	mytrends.add(10);


	function callback(response) {
		console.log("auth and list leaderboard callback ...");
	}

	var _bc = new Contact.BrainCloudWrapper("_mainWrapper");

	Contact.setCryptoJS(crypto);
	Contact.setWindow(http);

	_bc.brainCloudManager.setServerUrl("https://internal.braincloudservers.com");
	_bc.initialize("23782", "75135428-2395-470e-83a8-79a4eac690f0", "1.0.0");

	// var secret = "c100c4c2-92e6-4a12-8be0-4a9b5e95a66f";
	// var appId = "13229";
	// _bc.initialize(appId, secret, "1.0.0");

	_bc.authenticateAnonymous(callback);
	sleep(1);
	_bc.brainCloudClient.socialLeaderboard.listAllLeaderboards(callback);	
}