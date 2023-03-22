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
import json
import logging
import subprocess
import sys
from pathlib import Path
from typing import Tuple

from selenium.common.exceptions import SeleniumManagerException

logger = logging.getLogger(__name__)


class SeleniumManager:
    """Wrapper for getting information from the Selenium Manager binaries.

    This implementation is still in beta, and may change.
    """

    def __init__(self) -> None:
        pass

    @staticmethod
    def get_binary() -> Path:
        """Determines the path of the correct Selenium Manager binary.

        :Returns: The Selenium Manager executable location
        """
        directory = sys.platform
        if directory == "darwin":
            directory = "macos"
        elif directory in ("win32", "cygwin"):
            directory = "windows"

        file = "selenium-manager.exe" if directory == "windows" else "selenium-manager"

        path = Path(__file__).parent.joinpath(directory, file)

        if not path.is_file():
            tracker = "https://github.com/SeleniumHQ/selenium/issues"
            raise SeleniumManagerException(f"{path} is missing.  Please open an issue on {tracker}")

        return path

    def driver_location(self, browser: str) -> str:
        """
        Determines the path of the correct driver.
        :Args:
         - browser: which browser to get the driver path for.
        :Returns: The driver path to use
        """
        allowed = ("chrome", "firefox", "edge", "ie")
        if browser not in allowed:
            raise SeleniumManagerException(f"{browser} is not a valid browser.  Choose one of: {allowed}")

        if browser == "ie":
            browser = "iexplorer"

        binary, browser_flag, browser, output_flag, output = (
            str(self.get_binary()),
            "--browser",
            browser,
            "--output",
            "json",
        )
        result = self.run((binary, browser_flag, browser, output_flag, output))
        executable = result.split("\t")[-1].strip()
        logger.debug(f"Using driver at: {executable}")
        return executable

    @staticmethod
    def run(args: Tuple[str, str, str, str, str]) -> str:
        """
        Executes the Selenium Manager Binary.
        :Args:
         - args: the components of the command being executed.
        :Returns: The log string containing the driver location.
        """
        command = " ".join(args)
        logger.debug(f"Executing: {command}")
        completed_proc = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout = completed_proc.stdout.decode("utf-8").rstrip("\n")
        stderr = completed_proc.stderr.decode("utf-8").rstrip("\n")
        output = json.loads(stdout)
        result = output["result"]["message"]
        if completed_proc.returncode:
            raise SeleniumManagerException(f"Selenium manager failed for: {command}.\n{result}{stderr}")
        else:
            # Selenium Manager exited 0 successfully, return executable path and print warnings (if any)
            for item in output["logs"]:
                if item["level"] == "WARN":
                    logger.warning(item["message"])
            return result
