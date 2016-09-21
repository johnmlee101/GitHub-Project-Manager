var GHProjectManager = require('./index.js');
const _ = require('underscore');

const repoOwner = 'johnmlee101';
const repo = 'GitHub-Project-Manager';
// Test it by putting your info here
// User PW
var manager = new GHProjectManager('johnmlee101-test', process.env.MY_SECRET_ENV);

function callback(r, code) {
	console.log(r);
	console.log(code);
};

function errorCallback(e, code) {
	if (!_.isUndefined(e)) console.log(`[ERROR] Server returned ${e}`);
	console.log("[ERROR] Return code returned: "+code);
	process.exit(1);
};

if (manager.credentials.username === 'user') {
	console.log("Need to provide your own credentials!!!\n");
	process.exit(1);
}

// Cache Testing
manager.GetColumns(repoOwner, repo, 1, callback, errorCallback, true);
manager.GetProjects(repoOwner, repo, callback, errorCallback, true);
setTimeout(() => {
	manager.GetColumns(repoOwner, repo, 1, callback, errorCallback, true);
	setTimeout(() => {
		manager.GetProjects(repoOwner, repo, callback, errorCallback, true);
	},2000);
},2000);

// Card Testing
manager.GetCards('johnmlee101', 'GitHub-Project-Manager', 106445, true);