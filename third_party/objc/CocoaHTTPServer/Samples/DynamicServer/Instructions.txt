INFO:

This example project demonstrates the ability of the HTTPDynamicFileResponse to easily create dynamic content.

Take a look at the Web/index.html file. You'll notice a bunch of "%%PLACEHOLDERS%%" meant to be replaced dynamically. With only a few lines of code, the HTTPDynamicFileResponse will replace these automatically, and asynchronously, as the file gets uploaded to the client!

INSTRUCTIONS:

Open the Xcode project, and build and go.

On the Xcode console you'll see a message saying:
"Started HTTP server on port 59123"

Now open your browser and type in the URL:
http://localhost:59123

(Replace 59123 with whatever port the server is actually running on.)

Enjoy.