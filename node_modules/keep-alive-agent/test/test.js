/*global describe:true, it:true, before:true, after:true */

var
	chai = require('chai'),
	assert = chai.assert,
	should = chai.should(),
	http = require('http'),
	https = require('https'),
	KeepAliveAgent = require('../index'),
	util = require('util')
	;


var serverConfig = {
	hostname: 'localhost',
	port: 8000
};

function makeTestRequest(agent, callback)
{
	http.get(
	{
		hostname: serverConfig.hostname,
		port: serverConfig.port,
		path: '/',
		agent: agent
	}, callback);
}

describe('KeepAliveAgent', function()
{
	var server;

	beforeEach(function(done)
	{
		server = http.createServer(function(request, response)
		{
			response.end("pong")
		});
		server.on('listening', done);
		server.listen(serverConfig.port);
	});

	afterEach(function()
	{
		server.close();
		server = null;
	});

	it('constructs an agent with the passed-in options', function()
	{
		var agent = new KeepAliveAgent({ maxSockets: 3 });

		assert(agent.maxSockets === 3, 'max sockets option not passed through');
		agent.should.have.property('idleSockets');
	});

	it('provides a socket to a request', function(done)
	{
		var agent = new KeepAliveAgent();
		http.get(
		{
			hostname: serverConfig.hostname,
			port: serverConfig.port,
			path: '/',
			agent: agent
		}, function(res)
		{
			// if we get here at all, it worked
			done();
		});
	});

	it('re-uses sockets on repeated requests to the same host:port', function(done)
	{
		var agent = new KeepAliveAgent();
		var getOptions = {
			hostname: serverConfig.hostname,
			port: serverConfig.port,
			path: '/',
			agent: agent
		};

		var requestsToDo = 10;
		var intervalID;

		var requestOne = function()
		{
			http.get(getOptions, function(res)
			{
				if (--requestsToDo === 0)
				{
					clearInterval(intervalID);

					process.nextTick(function()
					{
						var name = serverConfig.hostname + ':' + serverConfig.port;

						agent.idleSockets.should.have.property(name);
						agent.idleSockets[name].should.be.an('array');
						agent.idleSockets[name].length.should.equal(1);
						var socket = agent.idleSockets[name][0];
						socket._requestCount.should.equal(10);

						done();
					});
				}
			});
		};

		intervalID = setInterval(requestOne, 15);
	});

	it('does not return destroyed sockets to the idle pool', function(done)
	{
		var agent = new KeepAliveAgent();
		makeTestRequest(agent, function(response)
		{
			response.connection.destroy();

			process.nextTick(function()
			{
				var name = serverConfig.hostname + ':' + serverConfig.port;
				agent.idleSockets.should.not.have.property(name);
				done();
			});
		});
	});

	it('does not attempt to use destroyed sockets from the idle list', function()
	{
		var agent = new KeepAliveAgent();
		var name = serverConfig.hostname + ':' + serverConfig.port;

		agent.idleSockets[name] = [];
		agent.idleSockets[name].push({ destroyed: true });
		agent.idleSockets[name].push({ destroyed: true });
		agent.idleSockets[name].push({ destroyed: true });
		agent.idleSockets[name].push({ destroyed: true });

		var socket = agent.nextIdleSocket(name);
		assert.equal(socket, null);
		assert.equal(agent.idleSockets[name].length, 0);
	});

	it('reuses a good socket until it is destroyed', function(done)
	{
		var agent = new KeepAliveAgent();
		var name = serverConfig.hostname + ':' + serverConfig.port;

		makeTestRequest(agent, function(response)
		{

			process.nextTick(function()
			{
				agent.idleSockets.should.have.property(name);
				assert(Array.isArray(agent.idleSockets[name]), 'expected idle sockets list for ' + name + ' to be an array');
				assert.equal(agent.idleSockets[name].length, 1, 'expected idle sockets list to contain exactly 1 item');
				var socket = agent.idleSockets[name][0];
				assert.equal(socket._requestCount, 1, 'expected socket request count to be 1')

				makeTestRequest(agent, function(response)
				{
					process.nextTick(function()
					{
						agent.idleSockets.should.have.property(name);
						assert.equal(agent.idleSockets[name].length, 0, 'expected zero sockets in our idle queue');
						done();
					});
					response.connection.destroy();
				});
			});
		});
	});
});

describe('KeepAliveAgent.Secure', function()
{
	it('can construct a secure keep-alive agent', function()
	{
		var secureAgent = new KeepAliveAgent.Secure({});
		assert(secureAgent.defaultPort === 443);
	});

	it('provides a socket to a request', function(done)
	{
		https.get(
		{
			hostname: 'one.voxer.com',
			port: 443,
			path: '/ping',
			agent: new KeepAliveAgent.Secure(),
		}, function(response)
		{
			// if we get here at all, it worked
			done();
		});
	});

	it('reuses sockets for secure connections', function(done)
	{
		var agent = new KeepAliveAgent.Secure();
		var getOptions = {
			hostname: 'one.voxer.com',
			port: 443,
			path: '/ping',
			agent: agent,
		};
		var name = 'one.voxer.com:443';

		https.get(getOptions, function(response)
		{

			process.nextTick(function()
			{
				agent.idleSockets.should.have.property(name);
				assert(Array.isArray(agent.idleSockets[name]), 'expected idle sockets list for ' + name + ' to be an array');
				assert.equal(agent.idleSockets[name].length, 1, 'expected idle sockets list to contain exactly 1 item');
				var socket = agent.idleSockets[name][0];
				assert.equal(socket._requestCount, 1, 'expected socket request count to be 1')

				https.get(getOptions, function(response)
				{
					process.nextTick(function()
					{
						agent.idleSockets.should.have.property(name);
						assert.equal(agent.idleSockets[name].length, 0, 'expected zero sockets in our idle queue');
						done();
					});
					response.connection.destroy();
				});
			});
		});
	});

	it('does not attempt to use destroyed sockets from the idle list', function()
	{
		var agent = new KeepAliveAgent.Secure();
		var name = serverConfig.hostname + ':' + serverConfig.port;

		agent.idleSockets[name] = [];
		agent.idleSockets[name].push({ pair: { ssl: null } });
		agent.idleSockets[name].push({ pair: { ssl: null } });
		agent.idleSockets[name].push({ pair: { ssl: null } });
		agent.idleSockets[name].push({ pair: { ssl: null } });
		agent.idleSockets[name].push({ pair: { ssl: null } });

		var socket = agent.nextIdleSocket(name);
		assert.equal(socket, null);
		assert.equal(agent.idleSockets[name].length, 0);
	});

});
