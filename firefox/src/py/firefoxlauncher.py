from subprocess import Popen
from subprocess import PIPE
import time
import platform
import os

class FirefoxLauncher(object):
    __shared_state = {}

    def __init__(self):
        self.__dict__ = self.__shared_state
        if "_start_cmd" not in self.__dict__:
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
        self.process = Popen([self._start_cmd, "-P", "WebDriver"])
        time.sleep(5)

    def CloseBrowser(self):
        Popen(["kill", "%d" % self.process.pid]).wait()


if __name__ == "__main__":
    FirefoxLauncher().LaunchBrowser()
