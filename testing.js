var GHProjectManager = require('./index.js');

// Test it by putting your info here
// User PW
var manager = new GHProjectManager('user', 'token');

if (manager.credentials.username === 'user') {
	console.log("Need to provide your own credentials!!!\n");
	process.exit(1);
}

//Cache Testing
manager.GetColumns('Expensify','Expensify',1, true);
manager.GetProjects('Expensify','Expensify', true);
setTimeout(() => {
	manager.GetColumns('Expensify','Expensify',1, true);
	setTimeout(() => {
		manager.GetProjects('Expensify','Expensify', true);
		setTimeout(() => {
			console.log(manager.cache);
		},2000);	
	},2000);
},2000);