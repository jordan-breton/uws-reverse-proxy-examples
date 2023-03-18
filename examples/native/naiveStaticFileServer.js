// region Imports

const fs = require('fs');
const url = require('url');
const path = require('path');
const stream = require('stream');

const {	randomBytes } = require('crypto');

const {
	server: {
		files: fileServerConfig
	},
	directories: {
		public: publicDir
	}
} = require('../conf');

// endregion
// region JSDOC Typedefs

/**
 * @private
 * @typedef RangeBoundary
 * @property {int} start
 * @property {int} end
 * @property {Object.<string, string>} headers
 */

/**
 * @private
 * @typedef DecodedRange
 * @property {number[][]} values Boundaries found in the raw range header
 * @property {string} raw The raw range header
 * @property {string} unit Most of the time, this is `bytes`
 * @property {RangeBoundary[]} boundaries requested ranges boundaries are here
 */

// endregion
// region Private declarations

/**
 * Decode a range header, return a consistent and reliable object with start/end
 *
 * @private
 * @param {string} rangeHeader
 * @param {int} fileSize
 * @param {Object} [opts={}]
 * @param {int} [opts.defaultRangeSize=15728640] ~15Mb
 * @return {DecodedRange|null}
 */
function decodeRange(
	rangeHeader,
	fileSize,
	{
		defaultRangeSize = 5120 * 1024 * 3
	} = {}
){
	if(!rangeHeader) return null;

	const range = {
		raw : rangeHeader,
		unit : rangeHeader.split('=').shift().toLowerCase(),
		boundaries: [],
		values : rangeHeader.split('=')
			.pop()
			.split(',')
			.filter(v => !!v)
			.map(v => v.trim().split('-').map(v => Number.parseInt(v)))
	};

	for(let [ start, end ] of range.values){
		if(start === null || Number.isNaN(start)){
			start = fileSize - end - 1;
		}

		if(end === null || Number.isNaN(end)){
			end = start + defaultRangeSize;
		}

		end = Math.min(end, fileSize - 1);

		if(start >= 0 && end <= fileSize && start < end){
			range.boundaries.push({
				start,
				end,
				headers: {
					'Content-Range': `${range.unit} ${start}-${end}/${fileSize}`
				}
			});
		}
	}

	return range;
}

/**
 * Generate a random string used a boundary in multipart/ranges response as delimiter
 * @private
 * @return {string}
 */
function generateBoundary(){
	return randomBytes(16).toString("hex");
}

// endregion

/**
 * The simplest file server possible, supporting ranges to serve navigable audio/video, if-modified-since
 * header and HEAD requests.
 *
 * @see [RFC 7233 - 4.1 Partial Content](https://www.rfc-editor.org/rfc/rfc7233#section-4.1)
 * @param {module:http.IncomingMessage} req
 * @param {module:http.ServerResponse} res
 * @return {Promise}
 */
async function serveStaticFile(req, res){
	const decodedUrl = url.parse(req.url);

	let requestedPath = path.resolve(
		path.join(publicDir, decodedUrl.pathname)
	);
	const fileExt = path.extname(requestedPath);

	if(!requestedPath.startsWith(publicDir)){
		res.writeHead(403);
		res.end('Forbidden!');
		return;
	}

	if(!fs.existsSync(requestedPath)){
		// Support for .html extension omission
		if(fileExt || !fs.existsSync(requestedPath + '.html')){
			res.writeHead(404);
			res.end('Not found!');
			return;
		} else {
			requestedPath += '.html';
		}
	}

	let stat = fs.statSync(requestedPath);

	if(stat.isDirectory()){
		// Support for automatically sending index.html when trying to access a directory,
		// if an index.html exists in the above-mentioned directory.
		if(!fs.existsSync(path.join(requestedPath, 'index.html'))){
			res.writeHead(403);
			res.end('Forbidden!');
			return;
		} else {
			requestedPath = path.join(requestedPath, 'index.html');
			stat = fs.statSync(requestedPath);
		}
	}

	if(stat.mtime.toUTCString() === req.headers['if-modified-since']){
		res.writeHead(304);
		res.end();
		return;
	}

	// Very basic Content-Type detection
	const mimeTypes = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
		'.jpg': 'image/jpeg',
		'.png': 'image/png',
		'.ico': 'image/x-icon',
		'.json': 'application/json',
		'.mp4': 'video/mp4'
	};
	const fileMime = mimeTypes[path.extname(requestedPath)] || 'application/octet-stream';

	const headers = {
		'Content-Type': fileMime,
		'Content-Length': stat.size,
		'Last-Modified': stat.mtime.toUTCString(),
		'Accept-Ranges': 'bytes'
	};

	/**
	 * An array containing the response body content as an array of Readable or ReadableStream
	 * Useful to send multipart responses.
	 */
	const content = [];

	let range = decodeRange(req.headers['range'], stat.size, fileServerConfig);

	// If at least one valid range header is specified, we respond with 206 partial content
	if(range && range.boundaries.length > 0 && range.unit === "bytes"){
		delete headers['Accept-Ranges'];
		delete headers['Last-Modified'];

		if(range.boundaries.length === 1){
			const { start, end, headers: rangeHeaders } = range.boundaries[0];

			headers['Content-Length'] = end - start + 1;

			// If we have only one range, the Content-Range header is happened to the response
			// readers as per RFC 72233
			res.writeHead(
				206,
				Object.assign(
					headers,
					rangeHeaders
				)
			);

			content.push(fs.createReadStream(requestedPath, { start, end }));
		} else {

			// We have a multi-ranges request
			let multipartBoundary = generateBoundary();

			// We reset content-length, since we must count every single byte in the response
			// body, including body-headers and boundaries
			headers['Content-Length'] = 0;
			headers['Content-Type'] = `multipart/byteranges; boundary=${multipartBoundary}`;

			for(let { start, end, rangeHeaders } of range.boundaries){
				// We start by adding the length of the requested file range
				headers['Content-Length'] += end - start + 1;

				// We compose a body header for each range with Content-Type and Content-Range
				// headers as per RFC 7233 - 4.1

				// If this is the first range we write, we don't need to add a newline before.
				let singlePartHeader = content.length !== 0 ? '\r\n' : '';

				singlePartHeader = `--${multipartBoundary}\r\n`;
				for(let key in rangeHeaders){
					singlePartHeader += `${key}: ${rangeHeaders[key]}\r\n`;
				}
				singlePartHeader += `Content-Type: ${fileMime}\r\n\r\n`;

				// We add to the response content-length the body header size
				headers['Content-Length'] += Buffer.byteLength(singlePartHeader, 'utf8');

				// We add the streams to the content array
				content.push(
					stream.Readable.from(singlePartHeader),
					fs.createReadStream(requestedPath, { start, end })
				);
			}

			// Adding the last boundary to indicate the previous stop there.
			let lastBoundary = `--${multipartBoundary}--`;
			headers['Content-Length'] += Buffer.byteLength(lastBoundary, 'utf8');
			content.push(stream.Readable.from(lastBoundary));

			// We finally can write our headers, since we know now the Content-Length
			res.writeHead(206, headers);
		}
	}else if(range){
		// No satisfiable range found
		headers['Content-Range'] = `bytes */${stat.size}`;
		headers['Content-Length'] = 0;
		res.writeHead(416, headers);
		res.end();
		return;
	}else{
		// Good old 200 response
		res.writeHead(200, headers);
		content.push(fs.createReadStream(requestedPath));
	}

	// If this is a HEAD request, we don't send the body
	if(req.method === 'HEAD'){
		res.end();
		return;
	}

	function sendContent(){
		const stream = content[0];

		stream.on('error', () => {
			try{
				res.writeHead(500, 'Server error');
				res.end('Server error');
			}catch(err){
				res.end();
			}
		});

		stream.on('close', () => {
			// We only remove it now. This way, if the response is aborted, our res.on('close') handler
			// will be able to destroy the stream.
			// otherwise it would stay open.
			content.shift();

			// Not finished yet!
			if(content.length > 0) sendContent();
		});

		stream.pipe(res);
	}

	res.on('close', () => {
		content.forEach(stream => stream.destroy());
	});

	sendContent();
}

module.exports = serveStaticFile;