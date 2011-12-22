INFO:

This example project demonstrates support for WebSockets.

The sample includes a Web folder which is added to the project, copied into the application's resources folder, and is set as the document root of the http server. It contains a simple index.html file and the client-side code (run in the web browser) for the websocket stuff.

Take a look at the MyWebSocket class to see the related server code.

INSTRUCTIONS:

Open the Xcode project, and build and go.

On the Xcode console you'll see a message saying:
"Started HTTP server on port 59123"

Now open a browser that supports WebSockets (e.g. Google Chrome or Safari)
and type in the URL:
http://localhost:59123

Enjoy.