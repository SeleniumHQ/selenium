# Copyright 2004 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#

# minimal web server.  
# serves files relative to the current directory.
# cgi-bin directory serves Python CGIs.

import BaseHTTPServer
import CGIHTTPServer
import time
import httplib
import sys

PORT = 8000

class HTTPHandler(CGIHTTPServer.CGIHTTPRequestHandler):
    """
    Simple Web Server that can handle query strings in a request URL and can be stopped with a request
    
    """
    
    quitRequestReceived = False
    
    def do_GET(self):
        # SimpleHTTPServer doesn't know how to handle query strings in 
        # 'GET' requests, so we're processing them here:
        if self.path.find('?') != -1:
            self.path, self.query_string = self.path.split('?', 1)
        else:
            self.query_string = ''

        # Add a delay before serving up the slow-loading test page
        if self.path.find('test_slowloading_page') != -1:
            time.sleep(0.3)
              
        # Carry on with the rest of the processing...
        CGIHTTPServer.CGIHTTPRequestHandler.do_GET(self)  

    def do_QUIT(self):
        self.send_response(200)
        self.end_headers()
        HTTPHandler.quitRequestReceived = True 

if __name__ == '__main__':
	port = PORT
	if len(sys.argv) > 1:
	    port = int(sys.argv[1])
	
        server_address = ('', port)
    	httpd = BaseHTTPServer.HTTPServer(server_address, HTTPHandler)
    
    	print "serving at port", port
    	print "To access the Selenium test suite, open"
    	print "  http://localhost:%s/index.html" % port

    	while not HTTPHandler.quitRequestReceived :
        	httpd.handle_request()	
	
