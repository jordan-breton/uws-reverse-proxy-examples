// region Imports

const url = require('url');
const http = require('http');
const uWebSockets = require('uWebSockets.js');
const { startUWS } = require('../helpers');

const {
	UWSProxy,
	createUWSConfig,
	createHTTPConfig
} = require('uws-reverse-proxy');

const serveFile = require('./naiveStaticFileServer');
const config = require('../conf');
const { server: { forwardTo, port } } = config;

// endregion
// HTTP setup

const httpServer =  http.createServer((req, res) => {
	const decodedRequest = url.parse(req.url);

	switch(decodedRequest.pathname){
		case '/json':
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end( JSON.stringify(config.data['/json']) );

			break;

		case '/config':
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({
				demo: 'native node:http'
			}));

			break;

		case '/redirect':
			res.writeHead(307, { 'Location': '/foo' });
			res.end();

			break;

		default:
			serveFile(req, res).catch(
				error => console.error('[ERR] naiveFileServer: ', error)
			);
	}
});
httpServer.listen(forwardTo.port, forwardTo.host, () => {
	console.log(`HTTP server listening at ${forwardTo.protocol}://${forwardTo.host}:${forwardTo.port}`);
});

// endregion
// region Proxy setup

const proxy = new UWSProxy(
	createUWSConfig(uWebSockets, { port }),
	createHTTPConfig(config.server.forwardTo)
);
proxy.start();

startUWS(proxy.uws.server, port);

// endregion