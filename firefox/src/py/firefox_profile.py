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

import ConfigParser
import logging
import os
import re
import shutil
import subprocess
import tempfile
import utils

DEFAULT_PORT = 7055
ANONYMOUS_PROFILE_NAME = "WEBDRIVER_ANONYMOUS_PROFILE"
        

def get_profile_ini():
    app_data_dir = utils.get_firefox_app_data_dir()
    profile_ini = ConfigParser.SafeConfigParser()
    profile_ini.read(os.path.join(app_data_dir, "profiles.ini"))
    return profile_ini


class FirefoxProfile(object):
    """Represents a firefox profile."""
    profile_ini = get_profile_ini()

    def __init__(self, name=ANONYMOUS_PROFILE_NAME, port=DEFAULT_PORT,
                 template_profile=None, extension_path=None):
        """Creates a FirefoxProfile.

        Args:
            name: the profile name. A new firefox profile is created if the one
                  specified doesn't exist.
            port: the port webdriver extension listens on for command
            template_profile: if not none, the content of the specified profile
                will be copied from this directory.
            extension_path: the source of the webdriver extension

        Usage:
            -- Get a profile with a given name: 
               profile = FirefoxProfile("profile_name")

            -- Get a new created profile:
               profile = FirefoxProfile()

            -- Get a new created profile with content copied from "/some/path":
               profile = FirefoxProfile(template_profile="/some/path")
        """
        self.name = name
        self.port = port
        if (extension_path is None):
            self.extension_path = os.path.join(os.path.dirname(__file__), 'webdriver.xpi')
        else:
	    self.extension_path = extension_path

        if name == ANONYMOUS_PROFILE_NAME:
            self._create_anonymous_profile(template_profile)
            self._refresh_ini()
        else:
            self.initialize()

    def _create_anonymous_profile(self, template_profile):
        self.anonymous_profile_dir = tempfile.mkdtemp()
        if template_profile is not None and os.path.exists(template_profile):
            self._copy_profile_source(template_profile)
        self._update_user_preference()
        self.add_extension(extension_zip_path=self.extension_path)
        self._launch_in_silent()

    def initialize(self):
        self.remove_lock_file()
        self.add_extension(True, extension_zip_path=self.extension_path)

    def _copy_profile_source(self, source_path):
        """Copy the profile content from source_path source_path.
        """
        logging.info("Copying profile from '%s' to '%s'" 
                     % (source_path, self.path))
        try:
            shutil.rmtree(self.path)
            shutil.copytree(source_path, self.path)
            self._launch_in_silent()
        except OSError, err:
            raise Exception("Errors in copying profile: %s" % err)
        
    def add_extension(self, force_create=True, extension_zip_path=None): 
        """Adds the webdriver extension to this profile.

           If force_create is True, the fxdriver extension is updated if a 
           new version is accessable. The old extension is untouched if the
           new version is unavailable, but it might be deleted if the new 
           version is accessable but the upgrade fails.

           If force_create is False, nothing will happen if the extension 
           directory exists and otherwise a new extension will be installed.

           The sources of a new extension are (in the order of preference)
           (1) zipped file webdriver-extension.zip in the current directory, 
               which can be created using 'rake firefox_xpi' in
               %webdriver_directory%, and
           (2) zipped files pointed by extension_zip_path, and
           (3) unzipped files specified by environment variable WEBDRIVER;
               these unzipped files must include the generated xpt files,
               see %webdriver_directory%/firefox/prebuilt, or run
               'rake firefox_xpi' and use the built files generated in
               %webdriver_directory%/build
           
           Default value of force_create is True. This enables users to 
           install new extension by attaching new extension as specified; if
           no files is specified, no installation will be performed even when
           force_creat is True.
        """

        extension_dir = os.path.join(self.path, 
                                     "extensions", "fxdriver@googlecode.com")
        logging.debug("extension_dir : %s" % extension_dir)

        if force_create or not os.path.exists(extension_dir):
            extension_source_path = utils.unzip_to_temp_dir(
                "webdriver.xpi")

            if (extension_source_path is None or
                not os.path.exists(extension_source_path)):
                extension_source_path = utils.unzip_to_temp_dir(
                    extension_zip_path)

            if (extension_source_path is None or
                not os.path.exists(extension_source_path)):
                webdriver_dir = os.getenv("WEBDRIVER")
                if webdriver_dir is not None:
                    extension_source_path = os.path.join(
                        webdriver_dir, "firefox", "src", "extension")

            if (extension_source_path is None or 
                not os.path.exists(extension_source_path)):
                raise Exception(
                    "No extension found at %s" % extension_source_path)

            logging.debug("extension_source_path : %s" % extension_source_path)
            logging.info("Copying extenstion from '%s' to '%s'" 
                % (extension_source_path, extension_dir))
            try:
                if os.path.exists(extension_dir):
                    shutil.rmtree(extension_dir) 
                else:
                    #copytree()'s behavior on linux makes me to write these
                    #two lines to ensure that the parent directory exists, 
                    #although it is not required according to the documentation.
                    os.makedirs(extension_dir)
                    shutil.rmtree(extension_dir) 
                shutil.copytree(extension_source_path, extension_dir)
                logging.info("Extenstion has been copied from '%s' to '%s'" 
                    % (extension_source_path, extension_dir))
            except OSError, err:
                logging.info("Fail to install firefox extension. %s" % err)

        else:
            logging.info("No extension installation required.")

    def remove_lock_file(self):
        for lock_file in [".parentlock", "lock", "parent.lock"]:
            try:
                os.remove(os.path.join(self.path, lock_file))
            except OSError:
                pass
    @property
    def path(self):
        if "anonymous_profile_dir" in self.__dict__:
            return self.anonymous_profile_dir
        section = self._get_ini_section()
        assert section is not None, "Profile doesn't exist in profiles.ini"
        return os.path.join(utils.get_firefox_app_data_dir(),
                            self.profile_ini.get(section, "Path"))

    @staticmethod
    def _refresh_ini():
        FirefoxProfile.profile_ini = get_profile_ini()

    def _launch_in_silent(self):
        os.environ["XRE_PROFILE_PATH"] = self.anonymous_profile_dir
        subprocess.Popen([utils.get_firefox_start_cmd(), "-silent"]).wait()

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
            logging.debug("user.js doesn't exist, creating one...")
        preference.update(self._get_webdriver_prefs())
        preference["webdriver.firefox_port"] = self.port
        user_pref_file = open(user_pref_file_name, "w")
        for key, value in preference.items():
            user_pref_file.write('user_pref("%s", %s);\n' % (key, value))
        user_pref_file.close()

        logging.info('user_pref after update:')
        logging.info(preference)

    def _delete_profile_if_exist(self):
        section = self._get_ini_section()
        if not section:
            return
        logging.info("deleting %s" % self.path)
        shutil.rmtree(self.path)
        
    def _get_ini_section(self):
        for section in self.profile_ini.sections():
            try:
                if self.profile_ini.get(section, "Name") == self.name:
                    return section
            except ConfigParser.NoOptionError:
                pass
        return None
        
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
