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
// region Proxy setup

const proxy = new UWSProxy(
	createUWSConfig(uWebSockets, { port }),
	createHTTPConfig(forwardTo)
);
proxy.start();

startUWS(proxy.uws.server, port);

// endregion