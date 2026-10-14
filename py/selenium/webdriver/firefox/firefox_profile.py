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
import tempfile
import warnings
import zipfile
from io import BytesIO


class FirefoxProfile:
    DEFAULT_PREFERENCES = {
        "browser.newtabpage.enabled": False,
        "browser.startup.homepage": "about:blank",
        "browser.usedOnWindows10.introURL": "about:blank",
        "network.captive-portal-service.enabled": False,
        "security.csp.enable": False,
        "startup.homepage_welcome_url": "about:blank",
    }

    def __init__(self, profile_directory=None):
        """Initialises a new instance of a Firefox Profile.

        Args:
            profile_directory: Directory of profile that you want to use. If a
                directory is passed in it will be cloned and the cloned directory
                will be used by the driver when instantiated.
                This defaults to None and will create a new
                directory when object is created.
        """
        self._desired_preferences = {}
        if profile_directory:
            newprof = os.path.join(tempfile.mkdtemp(), "webdriver-py-profilecopy")
            shutil.copytree(
                profile_directory, newprof, ignore=shutil.ignore_patterns("parent.lock", "lock", ".parentlock")
            )
            self._profile_dir = newprof
            os.chmod(self._profile_dir, 0o755)
        else:
            self._profile_dir = tempfile.mkdtemp()
            self._desired_preferences = copy.deepcopy(FirefoxProfile.DEFAULT_PREFERENCES)

    # Public Methods
    def set_preference(self, key, value):
        """Sets the preference that we want in the profile."""
        self._desired_preferences[key] = value

    def update_preferences(self):
        """Writes the desired user prefs to disk."""
        user_prefs = os.path.join(self._profile_dir, "user.js")
        if os.path.isfile(user_prefs):
            os.chmod(user_prefs, 0o644)
            self._read_existing_userjs(user_prefs)
        with open(user_prefs, "w", encoding="utf-8") as f:
            f.writelines(
                f'user_pref("{key}", {json.dumps(value)});\n' for key, value in self._desired_preferences.items()
            )

    # Properties

    @property
    def path(self):
        """Gets the profile directory that is currently being used."""
        return self._profile_dir

    @property
    def encoded(self) -> str:
        """Update preferences and create a zipped, base64-encoded profile directory string."""
        if self._desired_preferences:
            self.update_preferences()
        fp = BytesIO()
        with zipfile.ZipFile(fp, "w", zipfile.ZIP_DEFLATED, strict_timestamps=False) as zipped:
            path_root = len(self.path) + 1  # account for trailing slash
            for base, _, files in os.walk(self.path):
                for fyle in files:
                    filename = os.path.join(base, fyle)
                    zipped.write(filename, filename[path_root:])
        return base64.b64encode(fp.getvalue()).decode("UTF-8")

    def _read_existing_userjs(self, userjs):
        """Read existing preferences and add them to the desired preference dictionary."""
        pref_pattern = re.compile(r'user_pref\("(.*)",\s(.*)\)')
        with open(userjs, encoding="utf-8") as f:
            for usr in f:
                matches = pref_pattern.search(usr)
                try:
                    self._desired_preferences[matches.group(1)] = json.loads(matches.group(2))
                except Exception:
                    warnings.warn(
                        f"(skipping) failed to json.loads existing preference: {matches.group(1) + matches.group(2)}"
                    )
