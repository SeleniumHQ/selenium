var
	http = require('http'),
	https = require('https'),
	util = require('util')
	;

//----------------------------------------------------------------------------------------

function KeepAliveAgent(options)
{
	options = options || {};
	http.Agent.call(this, options);

	// Keys are host:port names, values are lists of sockets.
	this.idleSockets = {};

	// Replace the 'free' listener set up by the default node Agent above.
	this.removeAllListeners('free');
	this.on('free', KeepAliveAgent.prototype.freeHandler.bind(this));

}
util.inherits(KeepAliveAgent, http.Agent);

function buildNameKey(host, port, localAddress)
{
	var name = host + ':' + port;
	if (localAddress)
		name += ':' + localAddress;

	return name;
}

KeepAliveAgent.prototype.freeHandler = function(socket, host, port, localAddress)
{
	var name = buildNameKey(host, port, localAddress);

	// If the socket is still useful, return it to the idle pool.
	if (this.isSocketUsable(socket))
	{
		socket._requestCount = socket._requestCount ? socket._requestCount + 1 : 1;

		if (!this.idleSockets[name])
			this.idleSockets[name] = [];

		this.idleSockets[name].push(socket);
	}

	// If we had any pending requests for this name, send the next one off now.
	if (this.requests[name] && this.requests[name].length)
	{
		var nextRequest = this.requests[name].shift();

		if (!this.requests[name].length)
			delete this.requests[name];

		this.addRequest(nextRequest, host, port, localAddress);
	}
};

KeepAliveAgent.prototype.addRequest = function(request, host, port, localAddress)
{
	var name = buildNameKey(host, port, localAddress);

	var socket = this.nextIdleSocket(name);
	if (socket)
		request.onSocket(socket);
	else
		return http.Agent.prototype.addRequest.call(this, request, host, port, localAddress);
};

KeepAliveAgent.prototype.nextIdleSocket = function(name)
{
	if (!this.idleSockets[name])
		return null;

	var socket;
	while(socket = this.idleSockets[name].shift())
	{
		// Check that this socket is still healthy after sitting around on the shelf.
		// This check is the reason this module exists.
		if (this.isSocketUsable(socket))
			return socket;
	}

	return null;
};

KeepAliveAgent.prototype.isSocketUsable = function(socket)
{
	return !socket.destroyed;
};


KeepAliveAgent.prototype.removeSocket = function(socket, name, host, port, localAddress)
{
	if (this.idleSockets[name])
	{
		var idx = this.idleSockets[name].indexOf(socket);
		if (idx !== -1)
		{
			this.idleSockets[name].splice(idx, 1);
			if (!this.idleSockets[name].length)
				delete this.idleSockets[name];
		}
	}

	http.Agent.prototype.removeSocket.call(this, socket, name, host, port, localAddress);
};

//----------------------------------------------------------------------------------------

function HTTPSKeepAliveAgent(options)
{
	KeepAliveAgent.call(this, options);
	this.createConnection = https.globalAgent.createConnection;
}
util.inherits(HTTPSKeepAliveAgent, KeepAliveAgent);

HTTPSKeepAliveAgent.prototype.defaultPort = 443;

HTTPSKeepAliveAgent.prototype.isSocketUsable = function(socket)
{
	// TLS sockets null out their secure pair's ssl field in destroy() and
	// do not set a destroyed flag the way non-secure sockets do.
	return socket.pair && socket.pair.ssl;
};

//----------------------------------------------------------------------------------------

module.exports = KeepAliveAgent;
KeepAliveAgent.Secure = HTTPSKeepAliveAgent;
