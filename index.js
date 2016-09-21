const https = require('https');
const _ = require('underscore');

class GHProjectManager {

	constructor(user, token) {
		this.credentials = {
			username: user,
			token: token
		};

		var header = {
			'Accept': 'application/vnd.github.inertia-preview+json',
			'User-Agent': this.credentials.username
		};

		this.defaultOptions = {
			host: 'api.github.com',
			headers: header,
			auth: this.credentials.username + ":" + this.credentials.token
		};

		this.cache = {};
	}

	GetProjects(owner, repo, debug = false) {
		var options = _.clone(this.defaultOptions);
		options.path = '/repos/'+owner+'/'+repo+'/projects';
		options.method = 'GET';

		this.Request(options, (r) => {console.log(r)}, () => {}, true);		
	}

	GetColumns(owner, repo, projectID, debug = false) {
		var options = _.clone(this.defaultOptions);
		options.path = '/repos/'+owner+'/'+repo+'/projects/' + projectID + '/columns';
		options.method = 'GET';

		this.Request(options, (r) => {console.log(r)}, () => {}, debug);
	}

	Request(options, callback, errorCallback, debug = false) {
		if (!_.isUndefined(this.cache[options.path])) {
			options.headers['If-None-Match'] = this.cache[options.path].etag;
		}

		var req = https.request(options, (res) => {
			let response = '';
			if (debug) {
				console.log('status:',res.statusCode);
				console.log('headers:',res.headers);			
			}

			res.on('data', (d) => {
				response += d;
			});

			req.on('error', (e) => {
				if (debug) {
					console.error(e);
				}

				errorCallback(e);
			});

			res.on('end', () => {
				var key = options.path;

				// @TODO Put this into it's own function, possibly make the cache itself its own object.
				if (res.statusCode == 200) {
					var formattedResponse = JSON.parse(response);
					var etag = res.headers.etag;
					this.cache[key] = {
						etag: etag,
						value: formattedResponse
					}
					callback(formattedResponse);				
				} else if (res.statusCode == 304) {
					callback(this.cache[key].value);
				}
			});
		});
		req.end();
	}
}




module.exports = GHProjectManager;
