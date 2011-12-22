INFO:

The SecureWebSocketServer examples demonstrates two technologies:
- Creating a HTTPS server
- WebSockets

To create a secure HTTPS server, all connections must be secured using SSL/TLS.
And in order to do that, you need to have a X509 certificate.
Normally you PAY MONEY for these.
For example, you purchase them via Verisign.
However, for our example we're going to create a self-signed certificate.

This means that when you browse the server in Safari, it may present a warning saying the certificate is untrusted. (Which makes sense since you didn't pay money to a trusted 3rd party certificate agency.) To make things easier for testing, when Safari presents this warning, click the "show certificate" button.  And then click the "always trust this certificate" button.

Also, the first time you run the server, it will automatically create a self-signed certificate and add it to your keychain (under the name SecureHTTPServer). Now the SecureHTTPServer is authorized to access this keychain item - unless of course the binary changes. So if you make changes, or simply switch between debug/release builds, you'll keep getting prompted by the Keychain utility. To solve this problem, open the Keychain Access application. Find the "SecureHTTPServer" private key, and change it's Access Control to "Allow all applications to access this item".

The sample includes a Web folder which is added to the project, copied into the application's resources folder, and is set as the document root of the http server. It contains a simple index.html file and the client-side code (run in the web browser) for the websocket stuff.

It is fairly straight-forward. It will query the server for the time every second, and present the result on the page.

Take a look at the MyWebSocket class to see the related server code.

INSTRUCTIONS:

Open the Xcode project, and build and go.

On the Xcode console you'll see a message saying:
"Started HTTP server on port 59123"

Now open a browser that supports WebSockets (e.g. Google Chrome or Safari)
and type in the URL:
https://localhost:59123

Notice that you're using "https" and not "http".

(Replace 59123 with whatever port the server is actually running on.)

Enjoy.