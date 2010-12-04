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
import threading
import urllib
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

def updir():
    dirname = os.path.dirname
    return dirname(dirname(__file__))

LOGGER = logging.getLogger(__name__)
WEBDRIVER = os.environ.get("WEBDRIVER", updir())
HTML_ROOT = os.path.join(WEBDRIVER, "../../../../../../common/src/web")
if not os.path.isdir(HTML_ROOT):
    message = ("Can't find 'common_web' directory, try setting WEBDRIVER"
               " environment variable WEBDRIVER:" + WEBDRIVER + "  HTML_ROOT:" + HTML_ROOT )
    LOGGER.error(message)
    assert 0, message

DEFAULT_PORT = 8000


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
            self.send_error(404, 'File Not Found: %s' % path)

    def log_message(self, format, *args):
        """Override default to avoid trashing stderr"""
        pass

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
                LOGGER.debug("port %d is in use, trying to next one"
                              % port)
                port += 1

        self.thread = threading.Thread(target=self._run_web_server)

    def _run_web_server(self):
        """Runs the server loop."""
        LOGGER.debug("web server started")
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
        LOGGER.info("Shutting down the webserver")
        self.thread.join()

def main(argv=None):
    from optparse import OptionParser
    from time import sleep

    if argv is None:
        import sys
        argv = sys.argv

    parser = OptionParser("%prog [options]")
    parser.add_option("-p", "--port", dest="port", type="int",
            help="port to listen (default: %s)" % DEFAULT_PORT,
            default=DEFAULT_PORT)

    opts, args = parser.parse_args(argv[1:])
    if args:
        parser.error("wrong number of arguments") # Will exit

    server = SimpleWebServer(opts.port)
    server.start()
    print "Server started on port %s, hit CTRL-C to quit" % opts.port
    try:
        while 1:
            sleep(0.1)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()


