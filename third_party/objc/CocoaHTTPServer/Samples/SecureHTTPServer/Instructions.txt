INFO:

The SecureHTTPServer examples demonstrates creating a HTTPS server.

In order to do this, all connections must be secured using SSL/TLS.
And in order to do that, you need to have a X509 certificate.
Normally you PAY MONEY for these.
For example, you purchase them via Verisign.
However, for our example we're going to create a self-signed certificate.

This means that when you browse the server in Safari, it may present a warning saying the certificate is untrusted. (Which makes sense since you didn't pay money to a trusted 3rd party certificate agency.) To make things easier for testing, when Safari presents this warning, click the "show certificate" button.  And then click the "always trust this certificate" button.

Also, the first time you run the server, it will automatically create a self-signed certificate and add it to your keychain (under the name SecureHTTPServer). Now the SecureHTTPServer is authorized to access this keychain item - unless of course the binary changes. So if you make changes, or simply switch between debug/release builds, you'll keep getting prompted by the Keychain utility. To solve this problem, open the Keychain Access application. Find the "SecureHTTPServer" private key, and change it's Access Control to "Allow all applications to access this item".

INSTRUCTIONS:

Open the Xcode project, and build and go.

On the Xcode console you'll see a message saying:
"Started HTTP server on port 59123"

Now open your browser and type in the URL:
https://localhost:59123

Notice that you're using "https" and not "http".

(Replace 59123 with whatever port the server is actually running on.)

Enjoy.