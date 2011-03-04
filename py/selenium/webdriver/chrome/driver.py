# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc.
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
import os
from selenium.common.exceptions import RemoteDriverServerException
from selenium.webdriver.remote import utils
import subprocess
import httplib
import BaseHTTPServer
import SimpleHTTPServer
import threading
import Queue
import time
import urllib
import sys
import platform
import tempfile
import shutil
import signal
try:
    import json
except ImportError:
    import simplejson as json

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

class RequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
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
    except OSError.WindowsError:
        return ""

    return os.path.join(install_dir, "chrome.exe")

def _is_win7():
    return sys.getwindowsversion()[0] == 6

def _default_windows_location():
    if _is_win7():
        appdata = os.environ["LOCALAPPDATA"]
    else:
        home = os.path.expanduser("~")
        appdata = os.path.join(home, "Local Settings", "Application Data")

    return os.path.join(appdata, "Google", "Chrome", "Application", "chrome.exe")

def _windows_chrome():
    return _find_chrome_in_registry() or _default_windows_location()

def _linux_chrome():
    locations = [
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
    ]
    return _start_cmd(locations)

def _mac_chrome():
    locations = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    import getpass
    locations.append(os.path.join("/Users/", getpass.getuser(), "Applications", "Google Chrome.app", "Contents", "MacOS", "Google Chrome"))
    return _start_cmd(locations)

def _start_cmd(locations):
    cmd = ""
    for cmd_path in locations:
        if os.path.exists(cmd_path):
            cmd = cmd_path
    if cmd == "":
        raise RuntimeError("Unable to find browser")
    return cmd

_BINARY = {
    "win32": _windows_chrome,
    "darwin": _mac_chrome,
    "linux2": _linux_chrome,
}

def chrome_exe():
    return _BINARY[sys.platform]()

def touch(filename):
    with open(filename, "ab"):
        pass

def _copy_zipped_extension(extension_zip):
    extension_dir = utils.unzip_to_temp_dir(extension_zip)
    return extension_dir

def create_extension_dir():
    extension_dir = _copy_zipped_extension("chrome-extension.zip")
    if extension_dir:
        return extension_dir
    extension_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chrome-extension.zip")
    extension_dir = _copy_zipped_extension(extension_dir)
    if extension_dir:
        return extension_dir
    path = tempfile.mkdtemp()
    # FIXME: Copied manually
    extdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "extension")
    if not os.path.isdir(extdir):
        extdir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "extension")
        assert os.path.isdir(extdir), "can't find extension"
    # shutil.copytree need to create the directory
    shutil.rmtree(path)
    shutil.copytree(extdir, path)
    return path

def create_profile_dir():
    path = tempfile.mkdtemp()
    return path

PORT = 0

def on_error(func, path, exc_info):
    import stat
    if not os.access(path, os.W_OK):
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        pass

def run_chrome(extension_dir, profile_dir, port, untrusted_certificates, custom_args):
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
        "http://localhost:%s/chromeCommandExecutor" % port,
        untrusted_certificates,
        custom_args,
    ]
    return subprocess.Popen(command)

def run_server(timeout=10):
    server = BaseHTTPServer.HTTPServer(("", 0), RequestHandler)
    server.command_queue = Queue.Queue()
    server.result_queue = Queue.Queue()
    t = threading.Thread(target=server.serve_forever)
    t.daemon = True
    t.start()
    start = time.time()
    while time.time() - start < timeout:
        try:
            urllib.urlopen("http://localhost:%s" % server.server_port)
            break
        except IOError:
            time.sleep(0.1)
    else:
        raise RemoteDriverServerException("Can't open server after %s seconds" % timeout)
    return server

class ChromeDriver:
    def __init__(self, custom_profile=None, untrusted_certificates=False, custom_args=""):
        self._server = None
        self._profile_dir = custom_profile
        self._extension_dir = None
        self._chrome = None
        self._untrusted_certificates = " --ignore-certificate-errors " if untrusted_certificates else ""
        self._custom_args = custom_args

    def start(self):
        self._extension_dir = create_extension_dir()
        self._profile_dir = create_profile_dir() if self._profile_dir is None else self._profile_dir
        self._server = run_server()
        self._chrome = run_chrome(self._extension_dir, self._profile_dir,
                                  self._server.server_port, self._untrusted_certificates,
                                  self._custom_args)

    def stop(self):
        try:
            os.kill(self._chrome.pid, signal.SIGTERM)
        except AttributeError:
            if platform.version() == "Windows":
                import ctypes
                PROCESS_TERMINATE = 1
                handle = ctypes.windll.kernel32.OpenProcess(PROCESS_TERMINATE, False, self._chrome.pid)
                ctypes.windll.kernel32.TerminateProcess(handle, -1)
                ctypes.windll.kernel32.CloseHandle(handle)
        self._chrome = None
        if self._server:
            self._server.server_close()
            self._server = None
        for path in (self._profile_dir, self._extension_dir):
            try:
                shutil.rmtree(path, ignore_errors=False, onerror=on_error)
            except OSError:
                pass

    def execute(self, command, params):
        to_send = params.copy()
        to_send["request"] = command
        self._server.command_queue.put(to_send)
        return self._server.result_queue.get()
    
