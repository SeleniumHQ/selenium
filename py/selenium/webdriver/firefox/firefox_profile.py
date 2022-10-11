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

import base64
import copy
import json
import os
import re
import shutil
import sys
import tempfile
import warnings
import zipfile
from io import BytesIO
from xml.dom import minidom

from selenium.common.exceptions import WebDriverException


class FirefoxProfile:
    def __init__(self, profile_directory=None):
        """
        Initialises a new instance of a Firefox Profile

        :args:
         - profile_directory: Directory of profile that you want to use. If a
           directory is passed in it will be cloned and the cloned directory
           will be used by the driver when instantiated.
           This defaults to None and will create a new
           directory when object is created.
        """

        self.default_preferences = {}
        self.profile_dir = profile_directory
        self.tempfolder = None
        if not self.profile_dir:
            self.profile_dir = self._create_tempfolder()
        else:
            self.tempfolder = tempfile.mkdtemp()
            newprof = os.path.join(self.tempfolder, "webdriver-py-profilecopy")
            shutil.copytree(
                self.profile_dir, newprof, ignore=shutil.ignore_patterns("parent.lock", "lock", ".parentlock")
            )
            self.profile_dir = newprof
            os.chmod(self.profile_dir, 0o755)
        self.userPrefs = os.path.join(self.profile_dir, "user.js")
        if os.path.isfile(self.userPrefs):
            self._read_existing_userjs(os.path.join(self.profile_dir, "user.js"))
            os.chmod(self.userPrefs, 0o644)

    # Public Methods
    def set_preference(self, key, value):
        """
        sets the preference that we want in the profile.
        """
        self.default_preferences[key] = value

    def update_preferences(self):
        self._write_user_prefs()

    # Properties

    @property
    def path(self):
        """
        Gets the profile directory that is currently being used
        """
        return self.profile_dir

    @property
    def encoded(self) -> str:
        """
        A zipped, base64 encoded string of profile directory
        for use with remote WebDriver JSON wire protocol
        """
        self._write_user_prefs()
        fp = BytesIO()
        with zipfile.ZipFile(fp, "w", zipfile.ZIP_DEFLATED) as zipped:
            path_root = len(self.path) + 1  # account for trailing slash
            for base, _, files in os.walk(self.path):
                for fyle in files:
                    filename = os.path.join(base, fyle)
                    zipped.write(filename, filename[path_root:])
        return base64.b64encode(fp.getvalue()).decode("UTF-8")

    def _create_tempfolder(self):
        """
        Creates a temp folder to store User.js and the extension
        """
        return tempfile.mkdtemp()

    def _write_user_prefs(self):
        """
        writes the current user prefs dictionary to disk
        """
        with open(self.userPrefs, "w", encoding="utf-8") as f:
            for key, value in self.default_preferences.items():
                f.write(f'user_pref("{key}", {json.dumps(value)});\n')

    def _read_existing_userjs(self, userjs):
        pref_pattern = re.compile(r'user_pref\("(.*)",\s(.*)\)')
        with open(userjs, encoding="utf-8") as f:
            for usr in f:
                matches = pref_pattern.search(usr)
                try:
                    self.default_preferences[matches.group(1)] = json.loads(matches.group(2))
                except Exception:
                    warnings.warn(
                        "(skipping) failed to json.loads existing preference: %s" % matches.group(1) + matches.group(2)
                    )
