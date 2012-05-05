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
from __future__ import with_statement

import base64
import copy
import os
import re
import shutil
import tempfile
import zipfile
from cStringIO import StringIO
from xml.dom import minidom
from distutils import dir_util
from selenium.webdriver.common.proxy import ProxyType
from selenium.common.exceptions import WebDriverException


WEBDRIVER_EXT = "webdriver.xpi"
EXTENSION_NAME = "fxdriver@googlecode.com"

class FirefoxProfile(object):

    ANONYMOUS_PROFILE_NAME   = "WEBDRIVER_ANONYMOUS_PROFILE"
    DEFAULT_PREFERENCES = {
        "app.update.auto": "false",
        "app.update.enabled": "false",
        "browser.startup.page" : "0",
        "browser.download.manager.showWhenStarting": "false",
        "browser.EULA.override": "true",
        "browser.EULA.3.accepted": "true",
        "browser.link.open_external": "2",
        "browser.link.open_newwindow": "2",
        "browser.offline": "false",
        "browser.safebrowsing.enabled": "false",
        "browser.search.update": "false",
        "browser.sessionstore.resume_from_crash": "false",
        "browser.shell.checkDefaultBrowser": "false",
        "browser.tabs.warnOnClose": "false",
        "browser.tabs.warnOnOpen": "false",
        "browser.startup.page": "0",
        "browser.safebrowsing.malware.enabled": "false",
        "startup.homepage_welcome_url": "\"about:blank\"",
        "devtools.errorconsole.enabled": "true",
        "dom.disable_open_during_load": "false",
        "extensions.autoDisableScopes" : 10,
        "extensions.logging.enabled": "true",
        "extensions.update.enabled": "false",
        "extensions.update.notifyUser": "false",
        "network.manage-offline-status": "false",
        "network.http.max-connections-per-server": "10",
        "network.http.phishy-userpass-length": "255",
        "offline-apps.allow_by_default": "true",
        "prompts.tab_modal.enabled": "false",
        "security.fileuri.origin_policy": "3",
        "security.fileuri.strict_origin_policy": "false",
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
        "toolkit.networkmanager.disable": "true",
        "toolkit.telemetry.enabled": "false",
        "toolkit.telemetry.prompted": "2",
        "toolkit.telemetry.rejected": "true",
        "javascript.options.showInConsole": "true",
        "browser.dom.window.dump.enabled": "true",
        "webdriver_accept_untrusted_certs": "true",
        "webdriver_enable_native_events": "true",
        "webdriver_assume_untrusted_issuer": "true",
        "dom.max_script_run_time": "30",
        }

    def __init__(self,profile_directory=None):
        """
        Initialises a new instance of a Firefox Profile

        :args:
         - profile_directory: Directory of profile that you want to use.
           This defaults to None and will create a new
           directory when object is created.
        """
        self.default_preferences = copy.deepcopy(
            FirefoxProfile.DEFAULT_PREFERENCES)
        self.profile_dir = profile_directory
        if self.profile_dir is None:
            self.profile_dir = self._create_tempfolder()
        else:
            newprof = os.path.join(tempfile.mkdtemp(),
                "webdriver-py-profilecopy")
            shutil.copytree(self.profile_dir, newprof,
                ignore=shutil.ignore_patterns("parent.lock", "lock", ".parentlock"))
            self.profile_dir = newprof
            self._read_existing_userjs()
        self.extensionsDir = os.path.join(self.profile_dir, "extensions")
        self.userPrefs = os.path.join(self.profile_dir, "user.js")

    #Public Methods
    def set_preference(self, key, value):
        """
        sets the preference that we want in the profile.
        """
        clean_value = ''
        if value is True:
            clean_value = 'true'
        elif value is False:
            clean_value = 'false'
        elif isinstance(value, str):
            clean_value = '"%s"' % value
        elif isinstance(value, unicode):
            clean_value = '"%s"' % value
        else:
            clean_value = str(int(value))

        self.default_preferences[key] = clean_value

    def add_extension(self, extension=WEBDRIVER_EXT):
        self._install_extension(extension)

    def update_preferences(self):
        self._write_user_prefs(self.default_preferences)

    #Properties

    @property
    def path(self):
        """
        Gets the profile directory that is currently being used
        """
        return self.profile_dir

    @property
    def port(self):
        """
        Gets the port that WebDriver is working on
        """
        return self._port

    @port.setter
    def port(self, port):
        """
        Sets the port that WebDriver will be running on
        """
        if not isinstance(port, int):
            raise WebDriverException("Port needs to be an integer")
        self._port = port
        self.set_preference("webdriver_firefox_port", self._port)

    @property
    def accept_untrusted_certs(self):
        return self._santise_pref(
            self.default_preferences["webdriver_accept_untrusted_certs"])

    @accept_untrusted_certs.setter
    def accept_untrusted_certs(self, value):
        if value not in [True, False]:
            raise WebDriverException("Please pass in a Boolean to this call")
        self.set_preference("webdriver_accept_untrusted_certs", value)

    @property
    def assume_untrusted_cert_issuer(self):
        return self._santise_pref(self.default_preferences["webdriver_assume_untrusted_issuer"])

    @assume_untrusted_cert_issuer.setter
    def assume_untrusted_cert_issuer(self, value):
        if value not in [True, False]:
            raise WebDriverException("Please pass in a Boolean to this call")

        self.set_preference("webdriver_assume_untrusted_issuer", value)

    @property
    def native_events_enabled(self):
        return self._santise_pref(self.default_preferences['webdriver_enable_native_events'])

    @native_events_enabled.setter
    def native_events_enabled(self, value):
        if value not in [True, False]:
            raise WebDriverException("Please pass in a Boolean to this call")
        self.set_preference("webdriver_enable_native_events", value)

    @property
    def encoded(self):
        """
        A zipped, base64 encoded string of profile directory
        for use with remote WebDriver JSON wire protocol
        """
        fp = StringIO()
        zipped = zipfile.ZipFile(fp, 'w', zipfile.ZIP_DEFLATED)
        path_root = len(self.path) + 1 # account for trailing slash
        for base, dirs, files in os.walk(self.path):
            for fyle in files:
                filename = os.path.join(base, fyle)
                zipped.write(filename, filename[path_root:])
        zipped.close()
        return base64.encodestring(fp.getvalue())

    def set_proxy(self, proxy):
        if proxy is None:
            raise ValueError("proxy can not be None")

        if proxy.proxy_type is ProxyType.UNSPECIFIED:
            return

        self.set_preference("network.proxy.type", proxy.proxy_type['ff_value'])

        if proxy.proxy_type is ProxyType.MANUAL:
            self.set_preference("network.proxy.no_proxies_on", proxy.no_proxy)
            self._set_manual_proxy_preference("ftp", proxy.ftp_proxy)
            self._set_manual_proxy_preference("http", proxy.http_proxy)
            self._set_manual_proxy_preference("ssl", proxy.ssl_proxy)
        elif proxy.proxy_type is ProxyType.AUTODETECT:
            self.set_preference("network.proxy.autoconfig_url", proxy.proxy_autoconfig_url)

    #Private Methods
    def _santise_pref(self, item):
        if item == 'true':
            return True
        elif item == 'false':
            return False
        else:
            return item
    def _set_manual_proxy_preference(self, key, setting):
        if setting is None or setting is '':
            return

        host_details = setting.split(":")
        self.set_preference("network.proxy.%s" % key, host_details[1][2:])
        if len(host_details) > 1:
            self.set_preference("network.proxy.%s_port" % key, int(host_details[2]))

    def _create_tempfolder(self):
        """
        Creates a temp folder to store User.js and the extension
        """
        return tempfile.mkdtemp()

    def _write_user_prefs(self, user_prefs):
        """
        writes the current user prefs dictionary to disk
        """
        with open(self.userPrefs, "w") as f:
            for key, value in user_prefs.items():
                f.write('user_pref("%s", %s);\n' % (key, value))

    def _read_existing_userjs(self):
        userjs_path = os.path.join(self.profile_dir, 'user.js')
        PREF_RE = re.compile(r'user_pref\("(.*)",\s(.*)\)')
        try:
            with open(userjs_path) as f:
                for usr in f:
                    matches = re.search(PREF_RE, usr)
                    self.default_preferences[matches.group(1)] = matches.group(2)
        except:
            # The profile given hasn't had any changes made, i.e no users.js
            pass

    def _install_extension(self, addon, unpack=True):
        """
            Installs addon from a filepath, url
            or directory of addons in the profile.
            - path: url, path to .xpi, or directory of addons
            - unpack: whether to unpack unless specified otherwise in the install.rdf
        """
        if addon == WEBDRIVER_EXT:
            addon = os.path.join(os.path.dirname(__file__), WEBDRIVER_EXT)

        tmpdir = None
        xpifile = None
        if addon.endswith('.xpi'):
            tmpdir = tempfile.mkdtemp(suffix = '.' + os.path.split(addon)[-1])
            compressed_file = zipfile.ZipFile(addon, 'r')
            for name in compressed_file.namelist():
                if name.endswith('/'):
                    os.makedirs(os.path.join(tmpdir, name))
                else:
                    if not os.path.isdir(os.path.dirname(os.path.join(tmpdir, name))):
                        os.makedirs(os.path.dirname(os.path.join(tmpdir, name)))
                    data = compressed_file.read(name)
                    with open(os.path.join(tmpdir, name), 'wb') as f:
                        f.write(data)
            xpifile = addon
            addon = tmpdir

        # determine the addon id
        addon_details = self._addon_details(addon)
        addon_id = addon_details.get('id')
        assert addon_id, 'The addon id could not be found: %s' % addon

        # copy the addon to the profile
        extensions_path = os.path.join(self.profile_dir, 'extensions')
        addon_path = os.path.join(extensions_path, addon_id)
        if not unpack and not addon_details['unpack'] and xpifile:
            if not os.path.exists(extensions_path):
                os.makedirs(extensions_path)
            shutil.copy(xpifile, addon_path + '.xpi')
        else:
            dir_util.copy_tree(addon, addon_path, preserve_symlinks=1)

        # remove the temporary directory, if any
        if tmpdir:
            dir_util.remove_tree(tmpdir)

    def _addon_details(self, addon_path):
        """
            returns a dictionary of details about the addon
            - addon_path : path to the addon directory
            Returns:
            {'id': u'rainbow@colors.org', # id of the addon
            'version': u'1.4', # version of the addon
            'name': u'Rainbow', # name of the addon
            'unpack': False } # whether to unpack the addon
        """

        # TODO: We don't use the unpack variable yet, but we should: bug 662683
        details = {
            'id': None,
            'name': None,
            'unpack': True,
            'version': None
        }

        def get_namespace_id(doc, url):
            attributes = doc.documentElement.attributes
            namespace = ""
            for i in range(attributes.length):
                if attributes.item(i).value == url:
                    if ":" in attributes.item(i).name:
                        # If the namespace is not the default one remove 'xlmns:'
                        namespace = attributes.item(i).name.split(':')[1] + ":"
                        break
            return namespace

        def get_text(element):
            """Retrieve the text value of a given node"""
            rc = []
            for node in element.childNodes:
                if node.nodeType == node.TEXT_NODE:
                    rc.append(node.data)
            return ''.join(rc).strip()

        doc = minidom.parse(os.path.join(addon_path, 'install.rdf'))

        # Get the namespaces abbreviations
        em = get_namespace_id(doc, "http://www.mozilla.org/2004/em-rdf#")
        rdf = get_namespace_id(doc, "http://www.w3.org/1999/02/22-rdf-syntax-ns#")

        description = doc.getElementsByTagName(rdf + "Description").item(0)
        for node in description.childNodes:
            # Remove the namespace prefix from the tag for comparison
            entry = node.nodeName.replace(em, "")
            if entry in details.keys():
                details.update({ entry: get_text(node) })

        return details
