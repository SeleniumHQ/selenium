import logging
import os
import threading
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import urllib

HTML_ROOT = os.getenv("webdriver_test_htmlroot")
logger = logging.getLogger("webdriver.SimpleWebServer")

class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            self.path = self.path[1:].split('?')[0]
            f = open(os.path.join(HTML_ROOT, self.path))
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f.read())
            f.close()
            return
        except IOError:
            self.send_response(404,'File Not Found: %s' % self.path)

class SimpleWebServer(object):
    def __init__(self):
        self.stop_serving = False

    def _runWebServer(self):
        self.server = HTTPServer(('', 8000), MyHandler)
        logger.info("web server started")

        while not self.stop_serving:
            self.server.handle_request()
        self.server.server_close()
        logger.info("web server stopped")

    def start(self):
        self.thread = threading.Thread(target=self._runWebServer)
        self.thread.start()

    def stop(self):
        self.stop_serving = True
        try:
            urllib.URLopener().open("http://localhost:8000")
        except:
            pass  #the server has shutdown
        self.thread.join()

if __name__ == "__main__":
    server = SimpleWebServer()
    t = server.runWebServerInThread()
    t.join()
