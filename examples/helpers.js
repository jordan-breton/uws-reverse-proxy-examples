/**
 * Provide a helper to avoid repeating uWebSockets.js boilerplate in every example.
 * @file
 */

// region Imports

const TextDecoder = new(require("util").TextDecoder)();

// endregion

/**
 * Initialize a uWebSockets.js server.
 *
 * @param {import('uWebSockets.js').TemplatedApp} uwsServer An application created with App() or SSLApp()
 * @param {int} port The public port we want our application to listen to.
 */
function startUWS(uwsServer, port){

	// Configuring websockets
	uwsServer.ws('/*', {
		idleTimeout: 10,

		open(){  console.log('New client connected!') },
		close(){ console.log('Client disconnected!')  },

		message(socket, data, isBinary){
			if(isBinary) socket.send("Sorry, I don't support binary :/");
			else{
				const msg = TextDecoder.decode(data);

				console.log('Message received: ', msg);

				if(msg === 'ping'){
					socket.send('pong - ' + (new Date()).toUTCString());
				}else{
					socket.send('Sorry, I only play ping-pong :(');
				}
			}
		}
	})

	uwsServer.listen('0.0.0.0', port, listening => {
		if(listening){
			console.log(`uWebSockets.js listening on port 0.0.0.0:${port}`);
		}else{
			console.error(`Unable to listen on port 0.0.0.0:${port}!`);
		}
	});
}

module.exports = {
	startUWS
};