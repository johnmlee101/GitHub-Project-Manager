var GHProjectManager = require('./index.js');

const repoOwner = 'johnmlee101';
const repo = 'GitHub-Project-Manager';
// Test it by putting your info here
// User PW
var manager = new GHProjectManager('johnmlee101-test', process.env.MY_SECRET_ENV);

if (manager.credentials.username === 'user') {
	console.log("Need to provide your own credentials!!!\n");
	process.exit(1);
}

// Cache Testing
manager.GetColumns(repoOwner,repo,1, true);
manager.GetProjects(repoOwner,repo, true);
setTimeout(() => {
	manager.GetColumns(repoOwner,repo,1, true);
	setTimeout(() => {
		manager.GetProjects(repoOwner,repo, true);
		setTimeout(() => {
			console.log(manager.cache);
		},2000);	
	},2000);
},2000);

// Card Testing
//manager.GetCards('johnmlee101','GitHub-Project-Manager', 106445, true);