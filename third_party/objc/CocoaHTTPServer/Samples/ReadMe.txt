Welcome to CocoaHTTPServer!

This project provides you (the developer) with an embedded HTTP server.  It  was built using standard networking sockets and streams, and offers a wealth of features for your app:

- Built in support for bonjour broadcasting
- IPv4 and IPv6 support automatically
- Asynchronous networking
- Multithreading support
- Password protection using either digest access or basic authentication
- TLS/SSL encryption support
- Range request support for partial downloads and pause/resume
- Support for LARGE files (up to 16 exabytes)
- Heavily commented code

As is the nature of embedded servers, you probably want to do something cool with it.  Perhaps you simply want to serve up files, but maybe you want to provide dynamic content or allow user uploads.  No problem - you can use this code to do any/all of these tasks.

The suggested way to implement your custom server is by extending the HTTPServer and/or HTTPConnection classes.  You'll find several methods in these classes with documentation that says "override me to add support for..."  For example, if you wanted to add password protection to various resources, simply override the "isPasswordProtected" and "passwordForUser" methods.

If you have questions, you may email the mailing list:
http://groups.google.com/group/cocoahttpserver

PLEASE NOTE:

All sample xcode projects are simple examples of how to accomplish some task using CocoaHTTPServer.

Don't forget to use source control to stay up-to-date with the latest version of the code.

If you've implemented your custom server by extending the HTTPServer and HTTPConnection classes, it should be relatively easy to merge the latest improvements from subversion into your project.

If you would like to receive email notifications when changes are committed, you may subscribe to the commit mailing list:
http://groups.google.com/group/cocoahttpserver-commit