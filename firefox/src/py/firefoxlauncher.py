from subprocess import Popen
from subprocess import PIPE
import logging
import time
import platform
import os
from extensionconnection import ExtensionConnection

class FirefoxLauncher(object):
    __shared_state = {}

    def __init__(self):
        self.__dict__ = self.__shared_state
        if "_start_cmd" not in self.__dict__:
            self.extension_connection = ExtensionConnection()
            if platform.system() == "Darwin":
                self._start_cmd = "/Applications/Firefox.app/Contents/MacOS/firefox"
            elif platform.system() == "Windows":
                program_files = os.getenv("PROGRAMFILES")
                if program_files is None:
                    program_files = "\\Program Files"
                self._start_cmd = os.path.join(program_files, "Mozilla Firefox\\firefox.exe") 
            else:
                self._start_cmd = Popen(["which", "firefox2"], stdout=PIPE).communicate()[0].strip()

    def LaunchBrowser(self):
        if self.extension_connection.is_connectable():
            logging.debug("Browser already running, ignore")
        else:
            Popen([self._start_cmd, "-P", "WebDriver"])
            self._WaitUntilConnectable()

    def _WaitUntilConnectable(self):
        while not self.extension_connection.is_connectable():
            time.sleep(1)
            logging.debug("Waiting for browser to launch...")

        

if __name__ == "__main__":
    FirefoxLauncher().LaunchBrowser()
