const TextDecoder = new(require("util").TextDecoder)();

/**
 * Initialize a uWebSockets.js server
 * @param {import('uWebSockets.js').TemplatedApp} uwsServer
 * @param {int} port
 */
function startUWS(uwsServer, port){
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
}