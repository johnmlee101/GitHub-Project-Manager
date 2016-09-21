const https = require('https');
const _ = require('underscore');

class GHProjectManager {

	// @TODO The user/token logic will have to be replaced with oAuth tokens with an expiration
	constructor(user, token) {
		this.credentials = {
			username: user,
			token: token
		};

		// If this becomes a dedicated Integration we'll replace 'User-Agent' with the application name
		var header = {
			// Required for projects as of now
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

	GetProjects(owner, repo, callback, errorCallback, debug = false) {
		var options = _.clone(this.defaultOptions);
		options.path = '/repos/'+owner+'/'+repo+'/projects';
		options.method = 'GET';

		this.Request(options, callback, errorCallback, debug);		
	}

	GetColumns(owner, repo, projectID, callback, errorCallback, debug = false) {
		var options = _.clone(this.defaultOptions);
		options.path = '/repos/'+owner+'/'+repo+'/projects/' + projectID + '/columns';
		options.method = 'GET';

		this.Request(options, callback, errorCallback, debug);
	}

	GetCards(owner, repo, columnID, callback, errorCallback, debug = false) {
		var options = _.clone(this.defaultOptions);
		options.path = '/repos/'+owner+'/'+repo+'/projects/columns/'+columnID+'/cards';
		options.method = 'GET';

		this.Request(options, callback, errorCallback, debug);
	}

	GetIssues(owner, repo, callback, errorCallback, debug = false) {
		var options = _.clone(this.defaultOptions);
		options.path = '/repos/'+owner+'/'+repo+'/issues';
		options.method = 'GET';

		this.Request(options, callback, errorCallback, debug);
	}

	GetLabels(owner, repo, issueID, callback, errorCallback, debug = false) {
		this.GetIssue(owner, repo, issueID, (issue, code) => {
			callback(issue.labels, code);
		}, errorCallback, debug)
	}

	GetIssue(owner, repo, issueID, callback, errorCallback, debug = false) {
		this.GetIssues(owner, repo, (data, code) => {
			let issueMatch = _.find(data, function(issue) {
				return issue.id == issueID;
			});
			if (_.isUndefined(issueMatch)) {
				// @TODO figure out to handle misses
				callback(undefined, code);
			} else {
				callback(issueMatch, code);
			}
		}, errorCallback, debug);
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

			if (res.statusCode == 401) {
				errorCallback(null, res.statusCode);
			}

			res.on('data', (d) => {
				response += d;
			});

			req.on('error', (e) => {
				if (debug) {
					console.error(e);
				}
				errorCallback(e, res.statusCode);
			});

			res.on('end', () => {
				var key = options.path;

				// @TODO Put this into it's own function, possibly make the cache itself its own object.
				// Mainly since caches should only work with GET requests, nothing else.
				if (res.statusCode == 200) {
					var formattedResponse = JSON.parse(response);
					var etag = res.headers.etag;
					this.cache[key] = {
						etag: etag,
						value: formattedResponse
					}
					callback(formattedResponse, res.statusCode);				
				} else if (res.statusCode == 304) {
					callback(this.cache[key].value, res.statusCode);
				}
			});
		});
		req.end();
	}
}




module.exports = GHProjectManager;
