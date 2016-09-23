var GHProjectManager = require('./index.js')
const _ = require('underscore')

const repoOwner = 'johnmlee101'
const repo = 'GitHub-Project-Manager'
// Test it by putting your info here
// User PW
var manager = new GHProjectManager('johnmlee101-test', process.env.MY_SECRET_ENV)

function AssertCodeCallback (data, code, context = '') {
	context += ' [Code]'
	if (data.statusCode !== code) {
		console.log(`[ASSERT] ${context} Assert failed! ${data.statusCode} != ${code}`)
		process.exit(1)
	} else {
		console.log(`[ASSERT] ${context} Check. ${data.statusCode} = ${code}`)
	}
}

function AssertCountCallback (data, count, context = '') {
	context += ' [Count]'
	if (data.response.length !== count) {
		console.log(`[ASSERT] ${context} Assert failed! Wanted ${data.response.length} size but got ${count}`)
		process.exit(1)
	} else {
		console.log(`[ASSERT] ${context} Check. ${data.response.length} = ${count}`)
	}
}

// Cache Testing
function testCache (resolve, reject) {
	const context = '[testCache]'
	manager.ClearCache()
	manager.GetColumns(repoOwner, repo, 1, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			manager.GetColumns(repoOwner, repo, 1, false)
			.then(
				(data) => {
					AssertCodeCallback(data, 304, context)
					resolve()
				})
		})
}

// Card Testing
function testCards (resolve, reject) {
	const context = '[testCards]'
	manager.ClearCache()
	manager.GetCards(repoOwner, repo, 106445, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			resolve()
		})
}

function testProjects (resolve, reject) {
	const context = '[testProjects]'
	manager.ClearCache()
	manager.GetProjects(repoOwner, repo, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			resolve()
		})
}

function testColumns (resolve, reject) {
	const context = '[testColumns]'
	manager.ClearCache()
	manager.GetColumns(repoOwner, repo, 1, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			resolve()
		})
}

function testIssue (resolve, reject) {
	const context = '[testIssue]'
	manager.ClearCache()
	manager.GetIssue(repoOwner, repo, 178260045, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			resolve()
		})
}

// Issue Testing
function testIssues (resolve, reject) {
	manager.ClearCache()
	const context = '[testIssues]'
	manager.GetIssues(repoOwner, repo, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			resolve()
		})
}

// Label Testing
function testLabels (resolve, reject) {
	const context = '[testLabels]'
	manager.GetLabels(repoOwner, repo, 178260045, false)
	.then(
		(data) => {
			AssertCodeCallback(data, 200, context)
			AssertCountCallback(data, 7, context)
			resolve()
		})
}

// Testing with cards
function testCardManipulation (resolve, reject) {
	const context = '[test Card-Create-Move-Delete]'
	manager.GetColumns(repoOwner, repo, 1)
	.then((columns) => {
		AssertCodeCallback(columns, 200, context + ' GetColumns')
		manager.CreateCard(repoOwner, repo, columns.response[0].id, 'THIS IS A TEST')
		.then((card) => {
			AssertCodeCallback(card, 201, context + ' CreateCard')
			manager.MoveCard(repoOwner, repo, card.response.id, columns.response[1].id)
			.then((move) => {
				AssertCodeCallback(move, 201, context + ' MoveCard')
				manager.DeleteCard(repoOwner, repo, card.response.id)
				.then((deletion) => {
					AssertCodeCallback(deletion, 204, context + ' DeleteCard')
					resolve()
				})
			})
		})
	})
}

var tests = []
tests.push(testCards)
tests.push(testColumns)
tests.push(testProjects)
tests.push(testIssues)
tests.push(testIssue)
tests.push(testLabels)
tests.push(testCache)
tests.push(testCardManipulation)

function testNext () {
	var next = tests.pop()
	if (_.isUndefined(next)) {
		return
	}
	new Promise(next).then(() => { testNext() })
}

testNext()
