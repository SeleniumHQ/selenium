from subprocess import Popen
from subprocess import PIPE
import time
import platform
import os

class FirefoxLauncher(object):
  
    def LaunchBrowser(self):
        if platform.system() == "Darwin":
            cmd = "/Applications/Firefox.app/Contents/MacOS/firefox"
        elif platform.system() == "Windows":
            program_files = os.getenv("PROGRAMFILES")
            if program_files is None:
                program_files = "\\Program Files"
            cmd = os.path.join(program_files, "Mozilla Firefox\\firefox.exe") 
        else:
            cmd = Popen(["which", "firefox2"], stdout=PIPE).communicate()[0].strip()
        self.process = Popen([cmd, "-P", "WebDriver"])
        time.sleep(5)

    def CloseBrowser(self):
        Popen(["kill", "%d" % self.process.pid])

if __name__ == "__main__":
    FirefoxLauncher().LaunchBrowser()
