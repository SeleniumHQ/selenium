# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""A simple web server for testing purpose.
It serves the testing html pages that are needed by the webdriver unit tests."""

import logging
import os
import socket
import sys
import threading
import urllib
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer


try:
    HTML_ROOT = os.path.join(os.getenv("WEBDRIVER"), "common_web")
except Exception:
    logging.error("Environment variable 'WEBDRIVER' is not set, unable to"
                 " locate the test html files.")
    sys.exit(-1)
assert os.path.exists(HTML_ROOT), (
    "Unable to locate the test html files from %s" % HTML_ROOT)

DEFAULT_PORT = 8000
sys.stderr = open("http_stderr_log.txt",'a')
sys.stdout = open("http_stdout_log.txt",'a')

class HtmlOnlyHandler(BaseHTTPRequestHandler):
    """Http handler."""
    def do_GET(self):
        """GET method handler."""
        try:
            path = self.path[1:].split('?')[0]
            html = open(os.path.join(HTML_ROOT, path))
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html.read())
            html.close()
        except IOError:
            self.send_response(404,'File Not Found: %s' % path)

class SimpleWebServer(object):
    """A very basic web server."""
    def __init__(self, port=DEFAULT_PORT):
        self.stop_serving = False
        port = port
        while True:
            try:
                self.server = HTTPServer(
                    ('', port), HtmlOnlyHandler)
                self.port = port
                break
            except socket.error:
                logging.debug("port %d is in use, trying to next one"
                              % port)
                port += 1

        self.thread = threading.Thread(target=self._run_web_server)

    def _run_web_server(self):
        """Runs the server loop."""
        logging.debug("web server started")
        while not self.stop_serving:
            self.server.handle_request()
        self.server.server_close()

    def start(self):
        """Starts the server."""
        self.thread.start()

    def stop(self):
        """Stops the server."""
        self.stop_serving = True
        try:
            # This is to force stop the server loop
            urllib.URLopener().open("http://localhost:%d" % self.port)
        except Exception:
            pass
        logging.info("Shutting down the webserver")
        self.thread.join()
