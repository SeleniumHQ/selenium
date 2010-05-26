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

"""Launches the firefox and does necessary preparation like
installing the extension"""


from subprocess import Popen
import logging
import time
import os
from extensionconnection import ExtensionConnection
import utils

MAX_START_ATTEMPTS = 60

class FirefoxLauncher(object):
    """Launches the firefox browser."""

    def __init__(self):
        self.extension_connection = ExtensionConnection()
        self._start_cmd = utils.get_firefox_start_cmd()
        self.process = None

    def launch_browser(self, profile):
        """Launches the browser for the given profile name.
        It is assumed the profile already exists.
        """
        self.profile = profile
        while self.extension_connection.is_connectable():
            logging.info("Browser already running, kill it")
            self.extension_connection.connect_and_quit()
            time.sleep(1)
        self._start_from_profile_path(profile.path)

        attempts = 0
        while not self.extension_connection.is_connectable():
            attempts += 1
            if attempts >  MAX_START_ATTEMPTS:
                raise RuntimeError("Unablet to start firefox")
            self._start_from_profile_path(profile.path)
            time.sleep(1)

    def _lock_file_exists(self):
        return os.path.exists(os.path.join(self.profile.path, ".parentlock"))

    def kill(self):
        """Kill the browser.

        This is useful when the browser is stuck.
        """
        try:
            if self.process:
                os.kill(self.process.pid, 9)
        except AttributeError:
            # kill may not be available under windows environment
            pass

    def _start_from_profile_path(self, path):
        os.environ["XRE_PROFILE_PATH"] = path
        self.process = Popen([self._start_cmd, "-no-remote", "--verbose"])

    def _wait_until_connectable(self):
        """Blocks until the extension is connectable in the firefox."""
        while not self.extension_connection.is_connectable():
            logging.debug("Waiting for browser to launch...")
            if self.process.returncode:
                # Browser has exited
                return False
            time.sleep(1)
        return True
