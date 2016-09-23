const https = require('https')
const _ = require('underscore')

class GHProjectManager {

	// @TODO The user/token logic will have to be replaced with oAuth tokens with an expiration
	constructor (user, token) {
		this.credentials = {
			username: user,
			token: token
		}

		// If this becomes a dedicated Integration we'll replace 'User-Agent' with the application name
		var header = {
			// Required for projects as of now
			'Accept': 'application/vnd.github.inertia-preview+json',
			'User-Agent': this.credentials.username
		}

		// Options that should be consistent every time (other than the credentials).
		this.defaultOptions = {
			host: 'api.github.com',
			headers: header,
			auth: this.credentials.username + ':' + this.credentials.token
		}

		// Initialize cache object to be empty.
		// @TODO eventually save and load this from memory.
		this.cache = {}
	}

	/*
	 * Gets the list of projects associated with the given owner and repo.
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param boolean (optional) debug Display extra data?
	 */
	GetProjects (owner, repo, debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = '/repos/' + owner + '/' + repo + '/projects'
		options.method = 'GET'

		return this.Request(options, debug)
	}

	/*
	 * Gets the list of columns associated with the given owner, repo, and projectID.
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number projectID ID associated with the column
	 * @param boolean (optional) debug Display extra data?
	 */
	GetColumns (owner, repo, projectID, debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = '/repos/' + owner + '/' + repo + '/projects/' + projectID + '/columns'
		options.method = 'GET'

		return this.Request(options, debug)
	 }

	ClearCache () {
		this.cache = {}
	}

	/*
	 * Gets the list of cards associated with the given owner, repo, and columnID.
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number columnID ID associated with the cards
	 * @param boolean (optional) debug Display extra data?
	 */
	GetCards (owner, repo, columnID, debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = '/repos/' + owner + '/' + repo + '/projects/columns/' + columnID + '/cards'
		options.method = 'GET'

		return this.Request(options, debug)
	 }

	/*
	 * Gets the list of issues associated with the given owner and repo.
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param boolean (optional) debug Display extra data?
	 */
	GetIssues (owner, repo, debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = '/repos/' + owner + '/' + repo + '/issues'
		options.method = 'GET'

		return this.Request(options, debug)
	 }

	/*
	 * Gets the list of labels associated with the given owner, repo, and issueID.
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number issueID
	 * @param boolean (optional) debug Display extra data?
	 */
	GetLabels (owner, repo, issueID, debug = false) {
		return new Promise((resolve, reject) => {
			this.GetIssue(owner, repo, issueID, debug).then(
				(data) => {
					data.response = data.response.labels
					resolve(data)
				})
		})
	 }

	/*
	 * Gets the issue associated with the given owner, repo, and issueID.
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number issueID
	 * @param boolean (optional) debug Display extra data?
	 */
	GetIssue (owner, repo, issueID, debug = false) {
		return new Promise((resolve, reject) => {
			this.GetIssues(owner, repo, debug).then(
				(data) => {
					let issueMatch = _.find(data.response, function (issue) {
						return issue.id === issueID
					})
					data.response = issueMatch

					// Maybe reject if there is no good data...
					resolve(data)
				})
		})
	 }

	/*
	 * Creates a card at the specified column
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number columnID
	 * @param number|string contentID issue or PR to associate with the card
	 * @param string contentType "Issue" or "PullRequest"
	 * @param boolean (optional) debug Display extra data?
	 *
	 * Return codes
	 * 200 - success
	 */
	CreateCard (owner, repo, columnID, contentID, contentType = '', debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = `/repos/${owner}/${repo}/projects/columns/${columnID}/cards`
		options.method = 'POST'
		options.headers['Content-Type'] = 'application/x-www-form-urlencoded'

		var payload
		if (typeof (contentID) !== 'number') {
			payload = {
				note: contentID
			}
		} else {
			payload = {
				content_id: contentID,
				content_type: contentType
			}
		}

		payload = JSON.stringify(payload)
		options.headers['Content-Length'] = Buffer.byteLength(payload)
		return this.Request(options, debug, payload)
	 }

	/*
	 * Moves a card over to the specified Column
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number cardID
	 * @param number columnID
	 * @param string position [can be top, bottom, or after:<card-id>]
	 * @param boolean (optional) debug Display extra data?
	 */
	MoveCard (owner, repo, cardID, columnID, position = 'top', debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = `/repos/${owner}/${repo}/projects/columns/cards/${cardID}/moves`
		options.method = 'POST'
		options.headers['Content-Type'] = 'application/x-www-form-urlencoded'

		var payload = {
			position,
			column_id: columnID
		}

		payload = JSON.stringify(payload)
		options.headers['Content-Length'] = Buffer.byteLength(payload)
		return this.Request(options, debug, payload)
	 }

	/*
	 * Deletes a specified card
	 *
	 * @param string owner Owner username
	 * @param string repo Repository name
	 * @param number cardID
	 * @param boolean (optional) debug Display extra data?
	 */
	DeleteCard (owner, repo, cardID, debug = false) {
		var options = JSON.parse(JSON.stringify(this.defaultOptions))
		options.path = `/repos/${owner}/${repo}/projects/columns/cards/${cardID}`
		options.method = 'DELETE'

		return this.Request(options, debug)
	}

	/*
	 * Makes the web API request to GitHub with the given parameters.
	 *
	 * @param object options
	 * @param boolean (optional) debug Display extra data?
	 */
	Request (options, debug = false, payload = {}) {
		return new Promise((resolve, reject) => {
			if (!_.isUndefined(this.cache[options.path])) {
				options.headers['If-None-Match'] = this.cache[options.path].etag
			}

			var req = https.request(options, (res) => {
				let response = ''
				if (debug) {
					console.log('status:', res.statusCode)
					console.log('headers:', res.headers)
				}

				if (res.statusCode === 401 || res.statusCode === 422) {
					reject({header: res.headers, statusCode: res.statusCode})
				}

				if (options.method === 'DELETE') {
					if (res.statusCode === 204) {
						resolve({response: {}, statusCode: res.statusCode})
					} else {
						reject({header: res.headers, statusCode: res.statusCode})
					}
				}

				res.on('data', (d) => {
					response += d
				})

				req.on('error', (e) => {
					if (debug) {
						console.error(e)
					}
					reject({error: e, statusCode: res.statusCode})
				})

				res.on('end', () => {
					var key = options.path
					var formattedResponse = {}
					// @TODO Put this into it's own function, possibly make the cache itself its own object.
					// Mainly since caches should only work with GET requests, nothing else.
					if (res.statusCode === 200) {
						// Successful get
						var etag = res.headers.etag
						formattedResponse = JSON.parse(response)
						this.cache[key] = {
							etag: etag,
							value: formattedResponse
						}
						resolve({response: formattedResponse, statusCode: res.statusCode})
					} else if (res.statusCode === 304) {
						// No change
						resolve({response: this.cache[key].value, statusCode: res.statusCode})
					} else if (res.statusCode === 201) {
						// For creation
						formattedResponse = JSON.parse(response)
						resolve({response: formattedResponse, statusCode: res.statusCode})
					}
				})
			})
			if (options.method === 'POST') {
				req.write(payload)
			}
			req.end()
		})
	}
}

// Export this class as our package
module.exports = GHProjectManager
