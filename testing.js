var GHProjectManager = require('./index.js');
const _ = require('underscore');

const repoOwner = 'johnmlee101';
const repo = 'GitHub-Project-Manager';
// Test it by putting your info here
// User PW
var manager = new GHProjectManager('johnmlee101-test', process.env.MY_SECRET_ENV);

function callback(data, code = 0) {
	console.log(data);
	console.log(code);
};

function errorCallback(e, code) {
	if (!_.isUndefined(e)) console.log(`[ERROR] Server returned ${e}`);
	console.log("[ERROR] Return code returned: "+code);
	process.exit(1);
};

function AssertCodeCallback(code, context = "") {
	return (e, responseCode) => {
		if (responseCode != code ) {
			console.log(`[ASSERT] ${context} Assert failed!`);
			process.exit(1);
		} else {
			console.log(`[ASSERT] ${context} Check. ${responseCode} = ${code}`);
		}
	};
}

if (manager.credentials.username === 'user') {
	console.log("Need to provide your own credentials!!!\n");
	process.exit(1);
}

// Cache Testing
function testCache() {
	const context = "[testCache]";
	manager.GetColumns(repoOwner, repo, 1, AssertCodeCallback(200, context), errorCallback, false);
	manager.GetProjects(repoOwner, repo, AssertCodeCallback(200, context), errorCallback, false);
	setTimeout(() => {
		manager.GetColumns(repoOwner, repo, 1, AssertCodeCallback(304, context), errorCallback, false);
		setTimeout(() => {
			manager.GetProjects(repoOwner, repo, AssertCodeCallback(304, context), errorCallback, false);
		},2000);
	},2000);
}

// Card Testing
function testCards() {
	const context = "[testCards]";
	manager.GetCards('johnmlee101', 'GitHub-Project-Manager', 106445, AssertCodeCallback(200, context), errorCallback, false);
}

// Issue Testing
function testIssues() {
	const context = "[testIssues]";
	manager.GetIssues('johnmlee101', 'GitHub-Project-Manager', AssertCodeCallback(200, context), errorCallback, false);
}

// Label Testing
function testLabels() {
	const context = "[testLabels]";
	manager.GetLabels('johnmlee101', 'GitHub-Project-Manager', 178260045, AssertCodeCallback(304, context), errorCallback, false);
}

setTimeout(testCache, 0);
setTimeout(testCards, 5000);
setTimeout(testIssues, 7000);
setTimeout(testLabels, 9000);


