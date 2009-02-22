import logging
import os
import platform
import re
import tempfile
import simplejson
import shutil

DEFAULT_PORT = 7055

class ProfileIni(object):
    def __init__(self):
        self.refresh()
        
    def refresh(self):
        self.profiles = {}
        for p in self.read_profiles():
            self.profiles[p.name] = p

    def read_profiles(self):
        if platform.system() == "Windows":
            app_data_dir = os.path.join(os.getenv("APPDATA"), "Mozilla/Firefox")
        elif platform.system() == "Darwin":
            app_data_dir = os.path.join(os.getenv("HOME"), "Library/Application Support/Firefox")
        else:
            app_data_dir = os.path.join(os.getenv("HOME"), ".mozilla/firefox")
        profiles_ini = open(os.path.join(app_data_dir, "profiles.ini"))
        profile_sections = re.findall(r"Name=(\S*)\s*IsRelative=(\d)\s*Path=(\S*)", profiles_ini.read())
        return [FirefoxProfile(app_data_dir, *section)
                for section in profile_sections]

    def names(self):
        return [p.name for p in self.profiles]
        

class FirefoxProfile(object):
    def __init__(self, app_data_dir, name, is_relative, path, port=DEFAULT_PORT):
        self.app_data_dir = app_data_dir
        self.name = name
        self.is_relative = is_relative
        self.path = path
        self.port = port

    def add_extension(self, force_create=False):
        webdriver_dir = os.getenv("WEBDRIVER")
        extension_dir = os.path.join(self.app_data_dir, self.path, "extensions", "fxdriver@googlecode.com")
        if force_create or not os.path.exists(extension_dir):
            if not webdriver_dir:
                raise Exception("Please set WEBDRIVER to your webdriver directory")
            shutil.copytree(os.path.join(webdriver_dir, "firefox/src/extension"),
                            extension_dir)
        self._update_user_preference()

    def _update_user_preference(self):
        preference = {}
        user_pref_file_name = os.path.join(self.app_data_dir, self.path, "user.js")
        try:
            user_pref_file = open(user_pref_file_name)
            for line in user_pref_file:
                match = re.match(r'user_pref("(\.*?)","(\.*?)"')
                if match:
                    preference[match.group(1)] = match.group(2)
        except:
            pass
        preference.update(self._get_webdriver_prefs())
        preference["webdriver_firefox_port"] = self.port
        user_pref_file = open(user_pref_file_name, "w")
        for k, v in preference.items():
            user_pref_file.write('user_pref("%s", %s);\n' % (k, v))
        user_pref_file.close()
        

    def _get_webdriver_prefs(self):
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
    
