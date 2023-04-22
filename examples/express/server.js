// region Imports

const express = require('express');

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

const app = express();

app.use(express.static(config.directories.public, { extensions: [ 'html' ] }));

app.get('/json', (req, res) => {
	res.json(config.data['/json']);
});

app.get('/config', (req, res) => {
	res.json({ demo: 'express' });
});

app.get('/redirect', (req, res) => {
	res.redirect('/foo');
});

app.listen(forwardTo.port, forwardTo.host, () => {
	console.log(`Express HTTP server listening at ${forwardTo.protocol}://${forwardTo.host}:${forwardTo.port}`);
});

// endregion
// Proxy setup

if(!process.env.STANDALONE){
	const proxy = new UWSProxy(
		createUWSConfig(uWebSockets, { port }),
		createHTTPConfig(forwardTo)
	);
	proxy.start();

	startUWS(proxy.uws.server, port);
}

// endregion