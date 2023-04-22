// region Imports

const uWebSockets = require('uWebSockets.js');
const { startUWS } = require('../helpers');

const {
	UWSProxy,
	createUWSConfig,
	createHTTPConfig
} = require('uws-reverse-proxy');

const config = require('../conf');
const { server: { forwardTo, port } } = config;

// endregion
// region HTTP setup

const Fastify = require('fastify');

const fastify = Fastify();

fastify.register(require('@fastify/static'), {
	root: config.directories.public,
	extensions: [ 'html' ]
});

fastify.get('/json', {}, () => {
	return config.data['/json'];
});

fastify.get('/config', {}, () => {
	return { demo: 'fastify' };
});

fastify.get('/redirect', {}, (req, res) => {
	res.redirect('/foo');
});

fastify.listen({
	port: forwardTo.port,
	host: forwardTo.host
}, () => {
	console.log(`Fastify HTTP server listening at ${forwardTo.protocol}://${forwardTo.host}:${forwardTo.port}`);
});

// endregion
// region Proxy setup

if(!process.env.STANDALONE){
	const proxy = new UWSProxy(
		createUWSConfig(uWebSockets, { port }),
		createHTTPConfig(forwardTo)
	);
	proxy.start();

	startUWS(proxy.uws.server, port);
}

// endregion