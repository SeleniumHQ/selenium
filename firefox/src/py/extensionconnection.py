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

"""Communication with the firefox extension."""

import logging
import socket
import time
try:
    import json
except ImportError: # Python < 2.6
    import simplejson as json

# Some old JSON libraries don't have "dumps", make sure we have a good one
if not hasattr(json, 'dumps'):
  import simplejson as json

from selenium.remote.command import Command
from selenium.remote.remote_connection import RemoteConnection

_DEFAULT_TIMEOUT = 20
_DEFAULT_PORT = 7055
LOGGER = logging.getLogger("webdriver.ExtensionConnection")

class ExtensionConnection(RemoteConnection):
    """This class maintains a connection to the firefox extension.
    """
    def __init__(self, timeout=_DEFAULT_TIMEOUT):
        RemoteConnection.__init__(
            self, "http://localhost:%d/hub" % _DEFAULT_PORT)
        LOGGER.debug("extension connection initiated")
        self.timeout = timeout

    def quit(self, sessionId=None):
        self.execute(Command.QUIT, {'sessionId':sessionId})
        while self.is_connectable():
            logging.info("waiting to quit")
            time.sleep(1)

    def connect(self):
        """Connects to the extension and retrieves the session id."""
        return self.execute(Command.NEW_SESSION, {'desiredCapabilities':{
            'browserName': 'firefox',
            'platform': 'ANY',
            'version': '',
            'javascriptEnabled': True}})

    def connect_and_quit(self):
        """Connects to an running browser and quit immediately."""
        self._request('%s/extensions/firefox/quit' % self._url)

    def is_connectable(self):
        """Trys to connect to the extension but do not retrieve context."""
        try:
            socket_ = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket_.settimeout(1)
            socket_.connect(("localhost", _DEFAULT_PORT))
            socket_.close()
            return True
        except socket.error:
            return False

class ExtensionConnectionError(Exception):
    """An internal error occurred int the extension.

    Might be caused by bad input or bugs in webdriver
    """
    pass
