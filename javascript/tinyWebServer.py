# minimal web server.  
# serves files relative to the current directory.
# cgi-bin directory serves Python CGIs.

import BaseHTTPServer
import CGIHTTPServer

PORT = 8000

class HTTPHandler(CGIHTTPServer.CGIHTTPRequestHandler):
    """
    Simple Web Server that can handle query strings in a request URL.
    
    """
    def do_GET(self):
        # SimpleHTTPServer doesn't know how to handle query strings in 
        # 'GET' requests, so we're processing them here:
        if self.path.find('?') != -1:
            self.path, self.query_string = self.path.split('?', 1)
        else:
            self.query_string = ''
        
        # Carry on with the rest of the processing...
        CGIHTTPServer.CGIHTTPRequestHandler.do_GET(self)  
  

if __name__ == '__main__':
    server_address = ('', PORT)
    httpd = BaseHTTPServer.HTTPServer(server_address, HTTPHandler)
    print "serving at port", PORT
    print "To run the entire JsUnit test suite, open"
    print "  http://localhost:8000/jsunit/testRunner.html?testPage=http://localhost:8000/tests/JsUnitSuite.html&autoRun=true"
    print "To run the acceptance test suite, open"
    print "  http://localhost:8000/TestRunner.html"

    httpd.serve_forever()
