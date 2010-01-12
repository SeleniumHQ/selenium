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
import re
import threading
import time
try:
    import json
except ImportError: # Python < 2.6
    import simplejson as json
from ..common.exceptions import ErrorInResponseException

_DEFAULT_TIMEOUT = 20
_DEFAULT_PORT = 7055
LOGGER = logging.getLogger("webdriver.ExtensionConnection")

class ExtensionConnection(object):
    """This class maintains a connection to the firefox extension.
    """
    def __init__(self, timeout=_DEFAULT_TIMEOUT):
        LOGGER.debug("extension connection initiated")
        self.context = "null"
        self.socket = None
        self.timeout = timeout

    def driver_command(self, cmd, *params):
        """Driver level command."""
        return self.element_command(cmd, "null", *params)

    def element_command(self, cmd, element_id, *params):
        """Element level command."""
        json_dump = json.dumps({"parameters": params,
                                      "context": self.context,
                                      "elementId": element_id,
                                      "commandName":cmd})
        packet = 'Content-Length: %d\n\n' % len(json_dump)
        packet += json_dump
        packet += "\n"
        LOGGER.debug(packet)
        lock = threading.RLock()
        lock.acquire()
        self.socket.send(packet)
        if cmd == "quit" or cmd == "close":
            lock.release()
            return

        resp = ""
        while not resp.endswith("\n\n"):
            received = self.socket.recv(1)
            if received:
                resp += received
            else:
                raise ExtensionConnectionError(
                    "Error occurred when processing %s in the extension" % cmd)
        resp_length = int(re.match("Length: (\d+)", resp).group(1))
        for i in range(resp_length):
            resp += self.socket.recv(1)

        lock.release()
        LOGGER.debug(resp)
        sections = re.findall(r'{.*}', resp)
        if sections:
            json_content = sections[0]
            decoded = json.loads(json_content)
            if decoded["isError"]:
                raise ErrorInResponseException(
                    decoded['response'],
                    ("Error occurred when processing\n"
                     "packet:%s\nresponse:%s" % (packet, resp)))
            self.context = decoded["context"]  #Update our context
            return decoded
        else:
            return None

    def quit(self):
        self.driver_command("quit")
        while self.is_connectable():
            logging.info("waiting to quit")
            time.sleep(1)

    def connect(self):
        """Connects to the extension and retrieves the context id."""
        self._connect()
        self.context = "null"
        self.context = self.driver_command("newSession")["response"]

    def _connect(self):
        """Connects to the extension."""
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.settimeout(self.timeout)
        self.socket.connect(("localhost", _DEFAULT_PORT))

    def connect_and_quit(self):
        """Connects to an running browser and quit immediately."""
        self._connect()
        self.quit()

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
