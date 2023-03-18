window.addEventListener('DOMContentLoaded', async () => {
	const response = await fetch('/config');
	const config = await response.json();

	document.getElementById('demo-name').innerText = config.demo;

	if(config.note){
		const note = document.getElementById('note');
		note.innerText = config.note;
		note.classList.add('show');
	}
});

window.addEventListener("load", () => {
	// region Fetch

	document.getElementById('json').addEventListener('click', async () => {
		const response = await fetch('/json');
		const data = await response.json();

		document.getElementById('json-response').innerText = JSON.stringify(data, null, 4);
	});

	// endregion

	document.body.classList.remove('loading');

	// region WebSocket

	const socketPanel = document.querySelector('.websocket');
	const errorDisplay = document.getElementById('ws-infos');
	const pingDisplay = document.getElementById('ping-response');

	let socket = null;

	document.getElementById('ws-ping').addEventListener('click', () => {
		if(!socket){
			errorDisplay.innerText = 'Sorry, websocket connection unavailable!'
				+ ' Please click on the "retry" button next to connection status.';
			return;
		}

		try{
			socket.send('ping');
		}catch(err){
			errorDisplay.innerText = 'Unable to send through the socket: ' + err.stack;
		}
	});

	document.getElementById('ws-retry').addEventListener('click', connectWebSocket);

	function connectWebSocket(){
		socketPanel.classList.add('loading');
		errorDisplay.innerText = '';

		try{
			socket = new WebSocket(
				`${location.protocol === 'https' ? 'wss' : 'ws'}://${location.host}`
			);

			socket.addEventListener('open', () => {
				document.getElementById('ws-state').setAttribute('state', 'connected');
				socketPanel.classList.remove('loading');
			});

			socket.addEventListener('close', () => {
				document.getElementById('ws-state').setAttribute('state', 'not-connected');
				socket = null;
			});

			socket.addEventListener('message', event => {
				pingDisplay.innerText = event.data;
			});

			socket.addEventListener('error', event => {
				socketPanel.classList.remove('loading');
				errorDisplay.innerText = `WebSocket error (code ${event.code || 'not specified'}): ${event.reason || 'No reason specified'}`;
			});
		}catch(err){
			errorDisplay.innerText = 'Unable to connect: ' + err;
		}
	}

	connectWebSocket();

	// endregion
});