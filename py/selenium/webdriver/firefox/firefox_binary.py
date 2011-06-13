# Copyright 2008-2011 WebDriver committers
# Copyright 2008-2011 Google Inc.
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


import os
import platform
import logging
from subprocess import Popen, PIPE
from extension_connection import ExtensionConnection
from selenium.common.exceptions import WebDriverException
import time
import socket
import signal


class FirefoxBinary(object):

    NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so"

    def __init__(self, firefox_path=None):
        self._start_cmd = firefox_path 
        if self._start_cmd is None:
            self._start_cmd = self._get_firefox_start_cmd()

    def launch_browser(self, profile):
        """Launches the browser for the given profile name.
        It is assumed the profile already exists.
        """
        self.profile = profile

        self._start_from_profile_path(self.profile.path)
        self._wait_until_connectable() 
            
    def kill(self):
        """Kill the browser.

        This is useful when the browser is stuck.
        """
        try:
            if self.process:
                os.kill(self.process.pid, signal.SIGTERM)
                os.wait()
        except AttributeError:
            # kill may not be available under windows environment
            pass

    def _start_from_profile_path(self, path):
        os.environ["XRE_PROFILE_PATH"] = path
        os.environ["MOZ_CRASHREPORTER_DISABLE"] = "1"
        os.environ["MOZ_NO_REMOTE"] = "1"
        os.environ["NO_EM_RESTART"] = "1"
        Popen([self._start_cmd, "-silent"], stdout=PIPE, stderr=PIPE).wait()
        self.process = Popen([self._start_cmd], stdout=PIPE, stderr=PIPE)

    def is_connectable(self):
        """Trys to connect to the extension but do not retrieve context."""
        try:
            socket_ = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            socket_.settimeout(1)
            socket_.connect(("127.0.0.1", self.profile.port))
            socket_.close()
            return True
        except socket.error:
            return False

    def _wait_until_connectable(self):
        """Blocks until the extension is connectable in the firefox."""
        count = 0
        while not self.is_connectable():
            #LOGGER.debug("Waiting for browser to launch...")
            if self.process.returncode:
                # Browser has exited
                return False
            if count == 30:
                raise WebDriverException("Can't load the profile. Profile Dir : %s" % self.profile.path)
            count += 1
            time.sleep(1)
        return True

    def _find_exe_in_registry(self):
        from _winreg import OpenKey, QueryValue, HKEY_LOCAL_MACHINE
        import shlex
        keys = (
           r"SOFTWARE\Classes\FirefoxHTML\shell\open\command",
           r"SOFTWARE\Classes\Applications\firefox.exe\shell\open\command"
        )
        command = ""
        for path in keys:
            try:
                key = OpenKey(HKEY_LOCAL_MACHINE, path)
                command = QueryValue(key, "")
                break
            except WindowsError:
                pass
        else:
            return ""
    
        return shlex.split(command)[0]

    def _get_firefox_start_cmd(self):
        """Return the command to start firefox."""
        start_cmd = ""
        if platform.system() == "Darwin":
            start_cmd = ("/Applications/Firefox.app/Contents/MacOS/firefox-bin")
        elif platform.system() == "Windows":
            start_cmd = self._find_exe_in_registry() or self._default_windows_location()
        else:
            # Maybe iceweasel (Debian) is another candidate...
            for ffname in ["firefox2", "firefox", "firefox-3.0", "firefox-4.0"]:
                start_cmd = self.which(ffname)
                if start_cmd is not None:
                    break
        return start_cmd

    def _default_windows_location(self):
        program_files = os.getenv("PROGRAMFILES", r"\Program Files")
        return os.path.join(program_files, "Mozilla Firefox\\firefox.exe")

    def which(self, fname):
        """Returns the fully qualified path by searching Path of the given name"""
        for pe in os.environ['PATH'].split(os.pathsep):
            checkname = os.path.join(pe, fname)
            if os.access(checkname, os.X_OK) and not os.path.isdir(checkname):
                return checkname
        return None
