function WebSocketTest()
{
	if ("WebSocket" in window)
	{
		alert("WebSocket supported here!  :)\r\n\r\nBrowser: " + navigator.appName + " " + navigator.appVersion + "\r\n\r\n(based on Google sample code)");
	}
	else
	{
		// Browser doesn't support WebSocket
		alert("WebSocket NOT supported here!  :(\r\n\r\nBrowser: " + navigator.appName + " " + navigator.appVersion + "\r\n\r\n(based on Google sample code)");
	}
}