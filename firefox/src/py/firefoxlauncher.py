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
from subprocess import PIPE
import logging
import time
import platform
import os
from webdriver_firefox.extensionconnection import ExtensionConnection
from webdriver_firefox.firefox_profile import ProfileIni

class FirefoxLauncher(object):
    """Launches the firefox browser."""
    __shared_state = {}

    def __init__(self):
        self.__dict__ = self.__shared_state
        if "_start_cmd" not in self.__dict__:
            self.extension_connection = ExtensionConnection()
            if platform.system() == "Darwin":
                self._start_cmd = ("/Applications/Firefox.app/Contents/"
                                   "MacOS/firefox-bin")
            elif platform.system() == "Windows":
                program_files = os.getenv("PROGRAMFILES")
                if program_files is None:
                    program_files = "\\Program Files"
                self._start_cmd = os.path.join(program_files, 
                                               "Mozilla Firefox\\firefox.exe") 
            else:
                # Maybe iceweasel (Debian) is another candidate...
                for ffname in ["firefox2", "firefox", "firefox-3.0"]:
                    logging.debug("Searching for '%s'...", ffname)
                    process = Popen(["which", ffname], stdout=PIPE)
                    cmd = process.communicate()[0].strip()
                    if cmd != "":
                        logging.debug("Using %s", cmd)
                        self._start_cmd = cmd
                        break
            self.profile_ini = ProfileIni()
            self.process = None

    def launch_browser(self, profile_name):
        """Launches the browser."""
        if self.extension_connection.is_connectable():
            logging.info("Browser already running, kill it")
            self.extension_connection.connect_and_quit()
        if profile_name not in self.profile_ini.profiles:
            Popen([self._start_cmd, "-createProfile", profile_name]).wait()
            self.profile_ini.refresh()
        profile = self.profile_ini.profiles[profile_name]
        profile.remove_lock_file()
        profile.add_extension()
        self.process = Popen([self._start_cmd, "-no-remote", "--verbose", "-P",
               profile_name])
        self._wait_until_connectable()

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

    def _wait_until_connectable(self):
        """Blocks until the extension is connectable in the firefox."""
        while not self.extension_connection.is_connectable():
            time.sleep(1)
            logging.debug("Waiting for browser to launch...")
