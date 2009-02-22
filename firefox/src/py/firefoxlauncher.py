from subprocess import Popen
from subprocess import PIPE
import logging
import time
import platform
import os
from webdriver_firefox.extensionconnection import ExtensionConnection
from webdriver_firefox.firefox_profile import ProfileIni

class FirefoxLauncher(object):
    __shared_state = {}

    def __init__(self):
        self.__dict__ = self.__shared_state
        if "_start_cmd" not in self.__dict__:
            self.extension_connection = ExtensionConnection()
            if platform.system() == "Darwin":
                self._start_cmd = ("/Applications/Firefox.app/Contents/"
                                   "MacOS/firefox")
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
                    p = Popen(["which", ffname], stdout=PIPE)
                    cmd = p.communicate()[0].strip()
                    if cmd != "":
                        logging.debug("Using %s", cmd)
                        self._start_cmd = cmd
                        break
            self.profile_ini = ProfileIni()

    def LaunchBrowser(self, profile_name):
        if self.extension_connection.is_connectable():
            logging.debug("Browser already running, ignore")
        else:
            if profile_name not in self.profile_ini.profiles:
                Popen([self._start_cmd, "-createProfile", profile_name]).wait()
                self.profile_ini.refresh()
            self.profile_ini.profiles[profile_name].add_extension()
            Popen([self._start_cmd, "-no-remote", "--verbose", "-P",
                   profile_name])
            self._WaitUntilConnectable()

    def _WaitUntilConnectable(self):
        while not self.extension_connection.is_connectable():
            time.sleep(1)
            logging.debug("Waiting for browser to launch...")

        

if __name__ == "__main__":
    FirefoxLauncher().LaunchBrowser()
