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

"""Firefox Profile management."""

import logging
import os
import platform
import re
import shutil

DEFAULT_PORT = 7055

class ProfileIni(object):
    """Represents the Profiles.ini file."""
    def __init__(self):
        self.profiles = {}
        self.refresh()
        
    def refresh(self):
        """Reload profiles from profiles.ini file."""
        self.profiles = {}
        for profile in self.read_profiles():
            self.profiles[profile.name] = profile

    @staticmethod
    def read_profiles():
        """Reads the profiles from the profiles.ini file."""
        if platform.system() == "Windows":
            app_data_dir = os.path.join(os.getenv("APPDATA"), "Mozilla/Firefox")
        elif platform.system() == "Darwin":
            app_data_dir = os.path.join(os.getenv("HOME"),
                                        "Library/Application Support/Firefox")
        else:
            app_data_dir = os.path.join(os.getenv("HOME"), ".mozilla/firefox")
        profiles_ini = open(os.path.join(app_data_dir, "profiles.ini"))
        profile_sections = re.findall(
            r"Name=(\S*)\s*IsRelative=(\d)\s*Path=(\S*)", profiles_ini.read())
        return [FirefoxProfile(section[0], section[1],
                               os.path.join(app_data_dir, section[2]))
                for section in profile_sections]

    def names(self):
        """Gets the names of the profiles."""
        return [profile.name for profile in self.profiles]
        

class FirefoxProfile(object):
    """Represents a firefox profile."""
    def __init__(self, name, is_relative, path,
                 port=DEFAULT_PORT):
        self.name = name
        self.is_relative = is_relative
        self.path = path
        self.port = port

    def add_extension(self, force_create=False):
        """Adds the webdriver extension to this profile."""
        webdriver_dir = os.getenv("WEBDRIVER")
        extension_dir = os.path.join(self.path,
                                     "extensions", "fxdriver@googlecode.com")
        if force_create or not os.path.exists(extension_dir):
            if not webdriver_dir:
                raise Exception(
                    "Please set WEBDRIVER to your webdriver directory")
            shutil.copytree(
                os.path.join(webdriver_dir, "firefox/src/extension"),
                extension_dir)
        self._update_user_preference()

    def remove_lock_file(self):
        for lock_file in [".parentlock", "lock", "parent.lock"]:
            try:
                os.remove(os.path.join(self.path, lock_file))
            except OSError:
                pass

    def _update_user_preference(self):
        """Updates the user.js with the configurations needed by webdriver."""
        preference = {}
        user_pref_file_name = os.path.join(
            self.path, "user.js")
        try:
            user_pref_file = open(user_pref_file_name)
            for line in user_pref_file:
                match = re.match(r'user_pref\("(\.*?)","(\.*?)"', line)
                if match:
                    preference[match.group(1)] = match.group(2)
        except IOError:
            logging.debug("User.js doesn't exist, creating one...")
        preference.update(self._get_webdriver_prefs())
        preference["webdriver_firefox_port"] = self.port
        user_pref_file = open(user_pref_file_name, "w")
        for key, value in preference.items():
            user_pref_file.write('user_pref("%s", %s);\n' % (key, value))
        user_pref_file.close()
        
    @staticmethod
    def _get_webdriver_prefs():
        """Gets the preferences required by webdriver."""
        return {"app.update.auto": "false",
                "app.update.enabled": "false",
                "browser.download.manager.showWhenStarting": "false",
                "browser.EULA.override": "true",
                "browser.EULA.3.accepted": "true",
                "browser.link.open_external": "2",
                "browser.link.open_newwindow": "2",
                "browser.safebrowsing.enabled": "false",
                "browser.search.update": "false",
                "browser.sessionstore.resume_from_crash": "false",
                "browser.shell.checkDefaultBrowser": "false",
                "browser.startup.page": "0",
                "browser.tabs.warnOnClose": "false",
                "browser.tabs.warnOnOpen": "false",
                "dom.disable_open_during_load": "false",
                "extensions.update.enabled": "false",
                "extensions.update.notifyUser": "false",
                "security.warn_entering_secure": "false",
                "security.warn_submit_insecure": "false",
                "security.warn_entering_secure.show_once": "false",
                "security.warn_entering_weak": "false",
                "security.warn_entering_weak.show_once": "false",
                "security.warn_leaving_secure": "false",
                "security.warn_leaving_secure.show_once": "false",
                "security.warn_submit_insecure": "false",
                "security.warn_viewing_mixed": "false",
                "security.warn_viewing_mixed.show_once": "false",
                "signon.rememberSignons": "false",
                "startup.homepage_welcome_url": "\"about:blank\"",
                "javascript.options.showInConsole": "true",
                "browser.dom.window.dump.enabled": "true" ,
                }
    
