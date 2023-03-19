/**
 * Simple configuration shared accros examples.
 * @file
 * @private
 */

const path = require('path');

const config = {
	server: {
		// Listening port for our application
		port: Number.parseInt(process.env.PORT) || 80,

		// Config for our proxy to reach the HTTP server we want uWebSocket.js to forward requests to.
		forwardTo: {
			protocol: process.env.FORWARD_TO_PROTOCOL || 'http',
			host: process.env.FORWARD_TO_HOST || '127.0.0.1',
			port: Number.parseInt(process.env.FORWARD_TO_PORT) || 35794
		},

		files: {
			// Only used by example/native/naiveStaticFileServer.js to define the default range
			// size
			defaultRangeSize: 5120 * 1024 * 3
		}
	},
	directories: {
		// Current project root
		root: path.dirname(__dirname),

		// Public folder containing all public assets
		public: path.join(path.dirname(__dirname), 'public')
	},
	// random data
	data: {
		'/json' : {
			"already": "nobody",
			"buried": "play",
			"giant": true,
			"shoulder": "yard",
			"part": [
				"special",
				{
					"afternoon": false,
					"alive": 1447821987.0516129,
					"below": true,
					"watch": -1915817412,
					"myself": false,
					"disease": "primitive"
				},
				true,
				true,
				false,
				false
			],
			"pleasure": "frog"
		}
	}
};

module.exports = config;