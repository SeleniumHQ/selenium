# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""A simple web server for testing purpose.
It serves the testing html pages that are needed by the webdriver unit tests."""
import contextlib
import logging
import os
import re
import threading

try:
    from urllib import request as urllib_request
except ImportError:
    import urllib as urllib_request
try:
    from http.server import BaseHTTPRequestHandler
    from http.server import HTTPServer
    from socketserver import ThreadingMixIn
except ImportError:
    from BaseHTTPServer import BaseHTTPRequestHandler
    from BaseHTTPServer import HTTPServer
    from SocketServer import ThreadingMixIn


def updir():
    dirname = os.path.dirname
    return dirname(dirname(__file__))


LOGGER = logging.getLogger(__name__)
WEBDRIVER = os.environ.get("WEBDRIVER", updir())
HTML_ROOT = os.path.join(WEBDRIVER, "../../../../common/src/web")
if not os.path.isdir(HTML_ROOT):
    message = (
        "Can't find 'common_web' directory, try setting WEBDRIVER"
        " environment variable WEBDRIVER:" + WEBDRIVER + "  HTML_ROOT:" + HTML_ROOT
    )
    LOGGER.error(message)
    assert 0, message

DEFAULT_HOST = "localhost"
DEFAULT_HOST_IP = "127.0.0.1"
DEFAULT_PORT = 8000


class HtmlOnlyHandler(BaseHTTPRequestHandler):
    """Http handler."""

    def do_GET(self):
        """GET method handler."""
        try:
            path = self.path[1:].split("?")[0]
            if path[:5] == "page/":
                html = """<html><head><title>Page{page_number}</title></head>
                <body>Page number <span id=\"pageNumber\">{page_number}</span>
                <p><a href=\"../xhtmlTest.html\" target=\"_top\">top</a>
                </body></html>""".format(
                    page_number=path[5:]
                )
                html = html.encode("utf-8")
            else:
                with open(os.path.join(HTML_ROOT, path), encoding="latin-1") as f:
                    html = f.read().encode("utf-8")
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(html)
        except OSError:
            self.send_error(404, f"File Not Found: {path}")

    def do_POST(self):
        """POST method handler."""
        try:
            remaining_bytes = int(self.headers["content-length"])
            contents = ""
            line = self.rfile.readline()
            contents += line.decode("utf-8")
            remaining_bytes -= len(line)
            line = self.rfile.readline()
            contents += line.decode("utf-8")
            remaining_bytes -= len(line)
            fn = re.findall(r'Content-Disposition.*name="upload"; filename="(.*)"', line.decode("utf-8"))
            if not fn:
                self.send_error(500, f"File not found. {contents}")
                return
            line = self.rfile.readline()
            remaining_bytes -= len(line)
            contents += line.decode("utf-8")
            line = self.rfile.readline()
            remaining_bytes -= len(line)
            contents += line.decode("utf-8")
            preline = self.rfile.readline()
            remaining_bytes -= len(preline)
            while remaining_bytes > 0:
                line = self.rfile.readline()
                remaining_bytes -= len(line)
                contents += line.decode("utf-8")

            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()

            self.wfile.write(
                f"""<!doctype html>
                {contents}
                <script>window.top.window.onUploadDone();</script>
                """.encode()
            )
        except Exception as e:
            self.send_error(500, f"Error found: {e}")

    def log_message(self, format, *args):
        """Override default to avoid trashing stderr"""
        pass


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    pass


class SimpleWebServer:
    """A very basic web server."""

    def __init__(self, host=DEFAULT_HOST_IP, port=DEFAULT_PORT):
        self.stop_serving = False
        host = host
        port = port
        while True:
            try:
                self.server = ThreadedHTTPServer((host, port), HtmlOnlyHandler)
                self.host = host
                self.port = port
                break
            except OSError:
                LOGGER.debug(f"port {port} is in use, trying to next one")
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
        with contextlib.suppress(IOError):
            _ = urllib_request.urlopen(f"http://{self.host}:{self.port}")

    def where_is(self, path, localhost=False) -> str:
        # True force serve the page from localhost
        if localhost:
            return f"http://{DEFAULT_HOST}:{self.port}/{path}"
        return f"http://{self.host}:{self.port}/{path}"


def main(argv=None):
    from optparse import OptionParser
    from time import sleep

    if argv is None:
        import sys

        argv = sys.argv

    parser = OptionParser("%prog [options]")
    parser.add_option(
        "-p", "--port", dest="port", type="int", help=f"port to listen (default: {DEFAULT_PORT})", default=DEFAULT_PORT
    )

    opts, args = parser.parse_args(argv[1:])
    if args:
        parser.error("wrong number of arguments")  # Will exit

    server = SimpleWebServer(port=opts.port)
    server.start()
    print(f"Server started on port {opts.port}, hit CTRL-C to quit")
    try:
        while 1:
            sleep(0.1)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
