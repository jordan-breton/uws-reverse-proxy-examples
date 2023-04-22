// region Imports

const http = require('http');
const Koa = require('koa');
const koaStaticServe = require('koa-static');
const koaMount = require('koa-mount');
const koaRouter = require('koa-router');

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

const app = new Koa();
const router = koaRouter();

app.use(koaMount('/', koaStaticServe(config.directories.public, { extensions: [ 'html' ] })));

router.get('/json', async (ctx) => {
	ctx.response.set('content-type', 'application/json');
	ctx.body = JSON.stringify(config.data['/json']);
});

router.get('/config', async (ctx) => {
	ctx.response.set('content-type', 'application/json');
	ctx.body = JSON.stringify({
		demo: 'koa',
		note: "koa-static doesn't support range requests, so the video is not seekable."
			+ " Try any other example to see it in action."
	});
});

router.get('/redirect', async (ctx) => {
	ctx.redirect('/foo');
});

app.use(router.routes());

const server = http.createServer(app.callback());
server.listen(forwardTo.port, forwardTo.host, () => {
	console.log(`Koa HTTP server listening at ${forwardTo.protocol}://${forwardTo.host}:${forwardTo.port}`);
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