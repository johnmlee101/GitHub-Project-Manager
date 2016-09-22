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

function AssertCodeCallback(data, code, context = "") {
	context += " [Code]";
	if (data.statusCode != code ) {
		console.log(`[ASSERT] ${context} Assert failed! ${data.statusCode} != ${code}`);
		process.exit(1);
	} else {
		console.log(`[ASSERT] ${context} Check. ${data.statusCode} = ${code}`);
	}
}

function AssertCountCallback(data, count, context = "") {
	context += " [Count]";
	if ( data.response.length != count ) {
		console.log(`[ASSERT] ${context} Assert failed! Wanted ${data.response.length} size but got ${count}`);
		process.exit(1);
	} else {
		console.log(`[ASSERT] ${context} Check. ${data.response.length} = ${count}`);
	}
}

// Cache Testing
function testCache(resolve, reject) {
	const context = "[testCache]";
	manager.ClearCache();
	manager.GetColumns(repoOwner, repo, 1, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			manager.GetColumns(repoOwner, repo, 1, false)
			.then(
				(data) => {
					AssertCodeCallback(data, 304, context);
					resolve();
				});
		});
}

// Card Testing
function testCards(resolve, reject) {
	const context = "[testCards]";
	manager.ClearCache();
	manager.GetCards(repoOwner, 'GitHub-Project-Manager', 106445, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			resolve();
		});
}

function testProjects(resolve, reject) {
	const context = "[testProjects]";
	manager.ClearCache();
	manager.GetProjects(repoOwner, repo, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			resolve();
		});
}

function testColumns(resolve, reject) {
	const context = "[testColumns]";
	manager.ClearCache();
	manager.GetColumns(repoOwner, repo, 1, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			resolve();
		});
}

function testIssue(resolve, reject) {
	const context = "[testIssue]";
	manager.ClearCache();
	manager.GetIssue(repoOwner, repo, 178260045, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			resolve();
		});
}

// Issue Testing
function testIssues(resolve, reject) {
	manager.ClearCache();
	const context = "[testIssues]";
	manager.GetIssues(repoOwner, repo, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			resolve();
		});
}

// Label Testing
function testLabels(resolve, reject) {
	const context = "[testLabels]";
	manager.GetLabels(repoOwner, repo, 178260045, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context);
			AssertCountCallback(data, 7, context);
			resolve();
		});
}

var tests = [];
tests.push(testCards);
tests.push(testColumns);
tests.push(testProjects);
tests.push(testIssues);
tests.push(testIssue);
tests.push(testLabels);
tests.push(testCache);

function testNext() {
	var next = tests.pop();
	if (_.isUndefined(next)) {
		return;
	}
	new Promise(next).then(() => { testNext() });
}

testNext();

//testNext();

