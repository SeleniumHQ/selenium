# keep-alive-agent

keep-alive-agent is an HTTP connection pool agent for node.js that re-uses sockets. It is simpler than some agents that also solve this problem because it does not attempt to replace the Agent provided by node. If you want to re-use connections, use this agent. If you want the default node behavior, use the default global agent.

## Usage

__new KeepAliveAgent(*options-hash*)__

Create an instance of the agent, passing the options hash through to the node Agent constructor. These options are in turn passed along to `createConnection()`. The KeepAliveAgent constructor does not use the options itself. The option you are most likely to change is `maxSockets`, which defaults to 5.

To use the agent instance, set it in the `agent` field of the options passed to `http.request()` or `http.get()`. See the [http.request() documentation](http://nodejs.org/api/http.html#http_http_request_options_callback) for details.

__new KeepAliveAgent.Secure(*options-hash*)__

A keep-alive agent that creates tls sockets. Use it the same way you use the http agent.

## Examples

```javascript
var http = require('http'),
    KeepAliveAgent = require('keep-alive-agent');

var getOptions = {
    hostname: 'twitter.com',
    port: 80,
    path: '/dshaw',
    agent: new KeepAliveAgent(),
};
http.get(getOptions, function(response)
{
	response.pipe(process.stdout);
});
```

To re-use secure connections, use the Secure keep-alive agent:

```javascript
var https = require('https'),
    KeepAliveAgent = require('keep-alive-agent');

var getOptions = {
    hostname: 'www.duckduckgo.com',
    port: 443,
    path: '/?q=unicorns',
    agent: new KeepAliveAgent.Secure(),
};
https.get(getOptions, function(response)
{
	response.pipe(process.stdout);
});
```

## See Also

For other implementations, see [agentkeepalive](https://github.com/TBEDP/agentkeepalive) and the [request](https://github.com/mikeal/request) module's [ForeverAgent](https://github.com/mikeal/request/blob/master/forever.js).

## Licence

MIT.
