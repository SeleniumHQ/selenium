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

from __future__ import with_statement

from selenium.common.exceptions import RemoteDriverServerException
from selenium.remote import utils
from subprocess import Popen
import httplib
from BaseHTTPServer import HTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler
from threading import Thread
from Queue import Queue
try:
    import json
except ImportError:
    import simplejson as json

if not hasattr(json, 'dumps'):
    import simplejson as json

from time import sleep, time
from urllib import urlopen
from os.path import expanduser, join, dirname, abspath, isdir, isfile
from sys import platform
from tempfile import mkdtemp
from shutil import copytree, rmtree, copy
from os import environ

INITIAL_HTML = '''
<html>
    <head>
    <script type='text/javascript'>
            if (window.location.search == '') {
                setTimeout("window.location = window.location.href + '?reloaded'", 5000);
            }
    </script>
    </head>
    <body>
        <p>
            ChromeDriver server started and connected.  Please leave this tab open.
        </p>
    </body>
</html>'''

class RequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.respond(INITIAL_HTML, "text/html")

    # From my (Miki Tebeka) understanding, the driver works by sending a POST http
    # request to the server, the server replies with the command to execute and the
    # next POST reply will have the result. So we hold a command and result
    # queues on the server. When we get a POST request we see if there is a
    # response in there and place it in the result queue, then we pop the next
    # command from the command queue (blocking if needed) the post it to the
    # client.
    # FIXME: Somewhere here there is a race condition I'm still hunting.
    #        One option to try is http://blog.odegra.com/?p=3

    def do_POST(self):
        self.process_reply()
        command = self.server.command_queue.get()
        data = json.dumps(command)
        self.respond(data, "application/json")

    def process_reply(self):
        lines = []
        while not self.rfile.closed:
            line = self.rfile.readline()
            if line.strip() == "EOResponse":
                break
            lines.append(line)

        data = "".join(lines).strip()
        if not data:
            return

        self.server.result_queue.put(json.loads(data))

    def respond(self, data, content_type):
        self.send_response(httplib.OK)
        self.send_header("Content-type", content_type)
        self.send_header("Content-Length", len(data))
        self.end_headers()
        self.wfile.write(data)

    # Just to make it quiet
    def log_message(self, format, *args):
        pass

def _find_chrome_in_registry():
    from _winreg import OpenKey, QueryValue, HKEY_CURRENT_USER
    path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\Google Chrome"

    try:
        key = OpenKey(HKEY_CURRENT_USER, path)
        install_dir = QueryValue(key, "InstallLocation")
    except WindowsError:
        return ""

    return join(install_dir, "chrome.exe")

def _is_win7():
    import sys
    return sys.getwindowsversion()[0] == 6

def _default_windows_location():
    if _is_win7():
        appdata = environ["LOCALAPPDATA"]
    else:
        home = expanduser("~")
        appdata = join(home, "Local Settings", "Application Data")

    return join(appdata, "Google", "Chrome", "Application", "chrome.exe")

def _windows_chrome():
    return _find_chrome_in_registry() or _default_windows_location()


_BINARY = {
    "win32" : _windows_chrome,
    "darwin" : lambda: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "linux2" : lambda: "/usr/bin/google-chrome"
}

def chrome_exe():
    return _BINARY[platform]()

def touch(filename):
    with open(filename, "ab"):
        pass

def _copy_zipped_extension(extension_zip):
    extension_dir = utils.unzip_to_temp_dir(extension_zip)
    if extension_dir:
        if platform == "win32":
            manifest = "manifest-win.json"
        else:
            manifest = "manifest-nonwin.json"
        copy(join(extension_dir, manifest),
             join(extension_dir, "manifest.json"))
        return extension_dir

def create_extension_dir():
    extension_dir = _copy_zipped_extension("chrome-extension.zip")
    if extension_dir:
        return extension_dir

    extension_dir = join(dirname(abspath(__file__)), "chrome-extension.zip")
    extension_dir = _copy_zipped_extension(extension_dir)
    if extension_dir:
        return extension_dir

    path = mkdtemp()

    # FIXME: Copied manually
    extdir = join(dirname(abspath(__file__)), "extension")
    if not isdir(extdir):
        extdir = join(dirname(dirname(abspath(__file__))), "extension")
        assert isdir(extdir), "can't find extension"

    # copytree need to create the directory
    rmtree(path)
    copytree(extdir, path)
    if platform == "win32":
        # FIXME: Copied manually
        dll = join(dirname(__file__), "npchromedriver.dll")

        if not isfile(dll): # In source
            dll = r"..\..\prebuilt\Win32\Release\npchromedriver.dll"
            assert isfile(dll), "can't find dll"

        copy(dll, path)
        manifest = "manifest-win.json"
    else:
        manifest = "manifest-nonwin.json"
    copy(join(path, manifest), join(path, "manifest.json"))
    return path

def create_profile_dir():
    path = mkdtemp()
    touch(join(path, "First Run"))
    touch(join(path, "First Run Dev"))
    return path

# FIXME: Find a free one dinamically
PORT = 33292

def run_chrome(extension_dir, profile_dir, port):
    command = [
        chrome_exe(),
        "--load-extension=%s" % extension_dir,
        "--user-data-dir=%s" % profile_dir,
        "--activate-on-launch",
        "--disable-hang-monitor",
        "--homepage=about:blank",
        "--no-first-run",
        "--disable-popup-blocking",
        "--disable-prompt-on-repost",
        "--no-default-browser-check",
        "http://localhost:%s/chromeCommandExecutor" % port]
    return Popen(command)

def run_server(timeout=10):
    server = HTTPServer(("", 0), RequestHandler)
    server.command_queue = Queue()
    server.result_queue = Queue()
    t = Thread(target=server.serve_forever)
    t.daemon = True
    t.start()

    start = time()
    while time() - start < timeout:
        try:
            urlopen("http://localhost:%s" % server.server_port)
            break
        except IOError:
            sleep(0.1)
    else:
        raise RemoteDriverServerException("Can't open server after %s seconds" % timeout)

    return server

class ChromeDriver:
    def __init__(self):
        self._server = None
        self._profile_dir = None
        self._extension_dir = None
        self._chrome = None

    def start(self):
        self._extension_dir = create_extension_dir()
        self._profile_dir = create_profile_dir()
        self._server = run_server()
        self._chrome = run_chrome(self._extension_dir, self._profile_dir,
                                  self._server.server_port)

    def stop(self):
        if self._chrome:
            try:
                self._chrome.kill()
                self._chrome.wait()
                self._chrome = None
            except AttributeError:
                # POpen.kill is a python 2.6 API...
                pass

        if self._server:
            self._server.server_close()
            self._server = None

        for path in (self._profile_dir, self._extension_dir):
            if not path:
                continue
            try:
                rmtree(path)
            except IOError:
                pass

    def execute(self, command, params):
        to_send = params.copy()
        to_send["request"] = command
        self._server.command_queue.put(to_send)
        return self._server.result_queue.get()
