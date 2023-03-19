// region Imports

const express = require('express');

const config = require('../conf');
const { server: { forwardTo } } = config;

// endregion
// region HTTP setup

const app = express();

app.use(express.static(config.directories.public, { extensions: [ 'html' ] }));

app.get('/json', (req, res) => {
	res.json(config.data['/json']);
});

app.get('/config', (req, res) => {
	res.json({ demo: 'standalone express + standalone uWebSockets.js servers' });
});

app.get('/redirect', (req, res) => {
	res.redirect('/foo');
});

app.listen(forwardTo.port, forwardTo.host, () => {
	console.log(`Standalone express HTTP server listening at ${forwardTo.protocol}://${forwardTo.host}:${forwardTo.port}`);
});