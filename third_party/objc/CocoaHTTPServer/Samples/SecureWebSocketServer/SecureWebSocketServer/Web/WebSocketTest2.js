
var ws;
var t;

function init()
{
	document.getElementById('updateme').innerHTML = "connecting to websocket";
	OpenWebSocket();
}

function OpenWebSocket()
{ 
    if ("WebSocket" in window)
	{
		ws = new WebSocket("%%WEBSOCKET_URL%%");
		ws.onopen = function()
		{
			// Web Socket is connected
			
			document.getElementById('updateme').innerHTML = "websocket is open";
			
			t=setTimeout("SendMessage()",1000);
		};
		ws.onmessage = function(evt)
		{
			document.getElementById('updateme').innerHTML = evt.data;
		};
		ws.onclose = function()
		{
			document.getElementById('updateme').innerHTML = "websocket is closed";
			OpenWebSocket();
        };
        ws.onerror = function(evt)
		{
			alert("onerror: " + evt);
		};
	}
	else
	{
		alert("Browser doesn't support WebSocket!");
	}
}

function SendMessage()
{    
	if ("WebSocket" in window)
	{
		ws.send("time");
        
		t=setTimeout("SendMessage()",1000);
	}
	else
	{
		alert("Browser doesn't support WebSocket!");
	}
}