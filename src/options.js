'use strict'

const path = require('path')
const fileUtil = require('./fileUtil')
const fileHandlers = require('./fileHandlers')
const fileAuthorizers = require('./fileAuthorizers')

const DEFAULT_EXPRESS_OPTIONS = {
	'case sensitive routing': false,
	'jsonp callback name': null,
	'trust proxy': false,
	'views': null,
	'view cache': false,
	'x-powered-by': false
}

const DEFAULT_OPTIONS = {
	docsPath: '/api-docs',
	handlers: {
		path: './handlers',
		template: path.join(__dirname, '..', 'template', 'handler.mustache'),
		generate: true
	},
	authorizers: {
		path: './security',
		template: path.join(__dirname, '..', 'template', 'authorizer.mustache'),
		generate: true
	},
	unusedFilePrefix: '_'
}

exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS
exports.DEFAULT_EXPRESS_OPTIONS = DEFAULT_EXPRESS_OPTIONS
exports.applyDefaultOptions = applyDefaultOptions
exports.applyDefaultAppOptions = applyDefaultAppOptions

function applyDefaultOptions(options, extra) {
	const handlers = expandFlattenedOption(options, 'handlers')
	const authorizers = expandFlattenedOption(options, 'authorizers')

	options = Object.assign({}, DEFAULT_OPTIONS, options, extra)
	options.handlers = Object.assign({}, DEFAULT_OPTIONS.handlers, handlers)
	options.authorizers = Object.assign({}, DEFAULT_OPTIONS.authorizers, authorizers)
	options = applyTemplateOptions(options, 'handlers', fileHandlers)
	options = applyTemplateOptions(options, 'authorizers', fileAuthorizers)

	return options
}

function expandFlattenedOption(type, options) {
	const flattened = options[type]
	if (typeof flattened === 'string') return { path: flattened }
	else if (typeof flattened === 'function') return { create: flattened }
	else return flattened
}

function applyTemplateOptions(options, type, fileModule) {
	if (options[type].generate) {
		options[type].template = fileUtil.getTemplate(type, options)
		if (!options[type].getTemplateView) {
			options[type].getTemplateView = fileModule.getTemplateView
		}
	}
	return options
}


function applyDefaultAppOptions(app) {
	if (isExpress(app)) {
		applyDefaultExpressOptions(app)
	}
	return app
}

function isExpress(app) {
	return (!!app && !!app.set && !!app.render)
}

function applyDefaultExpressOptions(app) {
	Object.keys(DEFAULT_EXPRESS_OPTIONS)
		.forEach(name =>
			app.set(name, DEFAULT_EXPRESS_OPTIONS[name]))
}
