# uws-reverse-proxy-examples

Examples using the [uws-reverse-proxy](https://github.com/jordan-breton/uws-reverse-proxy) package (includes usage with some known frameworks too)

**Note:** The `PORT=7777` is a random port that should not conflit with any of your applications. That said,
it's optional. You can just avoid it and the server will start to listen on port `80` by default.

## Available options

The following `env` options are available for you to change some configuration quickly before
launching a demo. They're **always** available.

| Option              | Default       | Description                                                                                                                                                                                                    |
|---------------------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PORT                | `80`          | Listening port for uWebSockets.js. It's to this port that you'll try to connect, since the `FORWARD_TO_PORT` is meant to be private.                                                                           |
| FORWARD_TO_PROTOCOL | `'http'`      | Proxied HTTP server protocol (`'http'` or `'https'`). **No demo offers a TLS uWebSocket.js configuration** but this option allow you to test  `uws-reverse-proxy` with any http server you would want to test. |
| FORWARD_TO_PORT     | `35794`       | Port for the proxied HTTP server.                                                                                                                                                                              |
| FORWARD_TO_HOST     | `'127.0.0.1'` | Proxied HTTP server host.                                                                                                                                                                                      |

## Standalone

The demo offers two standalone servers. One with `uws-reverse-proxy`, the other with an `express` server.

They can work together to illustrate that the `uws-reverse-proxy` and the HTTP server don't have to be
in the same process. It also helps you to test `uws-reverse-proxy` with your own application
**without touching a line of your own code** :) Just configure your application's `protocol`, `host` and `port`
through [`FORWARD_TO_*` options](#available-options) for the proxy to be able to reach your HTTP application
et voilà!

If you specify any `FORWARD_TO_*` env variable for one and want to run both, you must obviously ensure to provide
the same value to both.

**Note:** The `PORT` configuration is useless for `standalone:http` since... it configures `uWebSockets.js`
listening port.

### HTTP

**Code directory**: [`examples/standalone`](/examples/standalone)

**Run**:

- With yarn: `yarn standalone:http`
- With npm: `npm run standalone:http`

### Proxy

**Code directory**: [`examples/standalone`](examples/standalone)

**Run**:

- With yarn: `PORT=7777 yarn standalone:reverse-proxy`
- With npm: `PORT=7777 npm run standalone:reverse-proxy`

**Browse**: [http://127.0.0.1:7777](http://127.0.0.1:7777)

## Integrated examples

In the following examples, `uws-reverse-proxy` is **integrated** to the HTTP server code. As
a result, each demo only spawn one process. If you want to test your own application with `uws-reverse-proxy`,
see [the standalone demo](/#standalone).

## Native `node:http`

**Code directory**: [`examples/native`](/examples/native)

**Run**: 

- With yarn: `PORT=7777 yarn native`
- With npm: `PORT=7777 npm run native`

**Browse**: [http://127.0.0.1:7777](http://127.0.0.1:7777)

## Express

**Code directory**: [`examples/express`](/examples/express)

**Run**:

- With yarn: `PORT=7777 yarn express`
- With npm: `PORT=7777 npm run express`

**Browse**: [http://127.0.0.1:7777](http://127.0.0.1:7777)

## Koa

**Code directory**: [`examples/koa`](/examples/koa)

**Run**:

- With yarn: `PORT=7777 yarn koa`
- With npm: `PORT=7777 npm run koa`

**Browse**: [http://127.0.0.1:7777](http://127.0.0.1:7777)

## Fastify

**Code directory**: [`examples/fastify`](/examples/fastify)

**Run**:

- With yarn: `PORT=7777 yarn fastify`
- With npm: `PORT=7777 npm run fastify`

**Browse**: [http://127.0.0.1:7777](http://127.0.0.1:7777)

## Nestjs

**Code directory**: [`examples/nestjs`](/examples/nestjs)

**Run**:

- With yarn: `PORT=7777 yarn nestjs`
- With npm: `PORT=7777 npm run nestjs`

**Browse**: [http://127.0.0.1:7777](http://127.0.0.1:7777)
