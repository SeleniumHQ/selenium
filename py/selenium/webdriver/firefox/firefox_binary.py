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


import os
import time
import warnings
from platform import system
from subprocess import STDOUT
from subprocess import Popen

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common import utils


class FirefoxBinary:

    def __init__(self, firefox_path=None, log_file=None):
        """
        Creates a new instance of Firefox binary.

        :Args:
         - firefox_path - Path to the Firefox executable. By default, it will be detected from the standard locations.
         - log_file - A file object to redirect the firefox process output to. It can be sys.stdout.
                      Please note that with parallel run the output won't be synchronous.
                      By default, it will be redirected to /dev/null.
        """
        warnings.warn(
            "FirefoxBinary has been deprecated, please use a string to the location of Firefox as necessary",
            DeprecationWarning,
            stacklevel=2,
        )

        self._start_cmd = firefox_path
        self.command_line = None
        self.platform = system().lower()
        if not self._start_cmd:
            self._start_cmd = self._get_firefox_start_cmd()
        if not self._start_cmd.strip():
            raise WebDriverException(
                "Failed to find firefox binary. You can set it by specifying "
                "the path to 'firefox_binary':\n\nfrom "
                "selenium.webdriver.firefox.firefox_binary import "
                "FirefoxBinary\n\nbinary = "
                "FirefoxBinary('/path/to/binary')\ndriver = "
                "webdriver.Firefox(firefox_binary=binary)"
            )

    def _find_exe_in_registry(self):
        try:
            from _winreg import HKEY_CURRENT_USER
            from _winreg import HKEY_LOCAL_MACHINE
            from _winreg import OpenKey
            from _winreg import QueryValue
        except ImportError:
            from winreg import OpenKey, QueryValue, HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER
        import shlex

        keys = (
            r"SOFTWARE\Classes\FirefoxHTML\shell\open\command",
            r"SOFTWARE\Classes\Applications\firefox.exe\shell\open\command",
        )
        command = ""
        for path in keys:
            try:
                key = OpenKey(HKEY_LOCAL_MACHINE, path)
                command = QueryValue(key, "")
                break
            except OSError:
                try:
                    key = OpenKey(HKEY_CURRENT_USER, path)
                    command = QueryValue(key, "")
                    break
                except OSError:
                    pass
        else:
            return ""

        if not command:
            return ""

        return shlex.split(command)[0]

    def _get_firefox_start_cmd(self):
        """Return the command to start firefox."""
        start_cmd = ""
        if self.platform == "darwin":  # small darwin due to lower() in self.platform
            ffname = "firefox"
            start_cmd = self.which(ffname)
            # use hardcoded path if nothing else was found by which()
            if not start_cmd:
                start_cmd = "/Applications/Firefox.app/Contents/MacOS/firefox-bin"
            # fallback to homebrew installation for mac users
            if not os.path.exists(start_cmd):
                start_cmd = os.path.expanduser("~") + start_cmd
        elif self.platform == "windows":  # same
            start_cmd = self._find_exe_in_registry() or self._default_windows_location()
        elif self.platform == "java" and os.name == "nt":
            start_cmd = self._default_windows_location()
        else:
            for ffname in ["firefox", "iceweasel"]:
                start_cmd = self.which(ffname)
                if start_cmd:
                    break
            else:
                # couldn't find firefox on the system path
                raise RuntimeError(
                    "Could not find firefox in your system PATH."
                    " Please specify the firefox binary location or install firefox"
                )
        return start_cmd

    def _default_windows_location(self):
        program_files = [
            os.getenv("PROGRAMFILES", r"C:\Program Files"),
            os.getenv("PROGRAMFILES(X86)", r"C:\Program Files (x86)"),
        ]
        for path in program_files:
            binary_path = os.path.join(path, r"Mozilla Firefox\firefox.exe")
            if os.access(binary_path, os.X_OK):
                return binary_path
        return ""

    def which(self, fname):
        """Returns the fully qualified path by searching Path of the given
        name"""
        for pe in os.environ["PATH"].split(os.pathsep):
            checkname = os.path.join(pe, fname)
            if os.access(checkname, os.X_OK) and not os.path.isdir(checkname):
                return checkname
        return None
