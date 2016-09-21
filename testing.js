var GHProjectManager = require('./index.js');

// Test it by putting your info here
// User PW
var manager = new GHProjectManager('johnmlee101-test', process.env.MY_SECRET_ENV);

if (manager.credentials.username === 'user') {
	console.log("Need to provide your own credentials!!!\n");
	process.exit(1);
}

//Cache Testing
/* manager.GetColumns('johnmlee101','GitHub-Project-Manager',1, true);
manager.GetProjects('johnmlee101','GitHub-Project-Manager', true);
setTimeout(() => {
	manager.GetColumns('johnmlee101','GitHub-Project-Manager',1, true);
	setTimeout(() => {
		manager.GetProjects('johnmlee101','GitHub-Project-Manager', true);
		setTimeout(() => {
			console.log(manager.cache);
		},2000);	
	},2000);
},2000); */

// Card Testing
//manager.GetCards('johnmlee101','GitHub-Project-Manager', 106445, true);