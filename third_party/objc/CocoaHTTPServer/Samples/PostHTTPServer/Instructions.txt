INFO:

This is an extremely simplified example of accepting a POST.

The included Web folder is added to the project, copied into the applications resource bundle, and set as the document root of the http server. It only has a single index.html file which prompts you to answer a simple math question. Your answer is submitted as a post.

The MyHTTPConnection class reads your response, and dynamically generates the response.

INSTRUCTIONS:

Open the Xcode project, and build and go.

On the Xcode console you'll see a message saying:
"Started HTTP server on port 59123"

Now open your browser and type in the URL:
http://localhost:59123

(Replace 59123 with whatever port the server is actually running on.)

Enjoy.