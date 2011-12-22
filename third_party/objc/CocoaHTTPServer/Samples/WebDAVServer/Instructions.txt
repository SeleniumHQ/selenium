INFO:

This project demonstrates WebDAV support. It makes your local ~/Sites directory available through the protocol.

INSTRUCTIONS:

Open the Xcode project, and build and go.

On the Xcode console you'll see a message saying:
"Started HTTP server on port 8080"

Now open the Mac Finder, and click:
Go -> Connect to Server… (Or type command K)

You will be prompted to enter the server address. Type in:
http://localhost:8080

Then click connect.
You will be prompted for a username and password, but this sample doesn't have any such restrictions so you can just login as a guest.

Then the finder will mount the DAV volume!

Enjoy.