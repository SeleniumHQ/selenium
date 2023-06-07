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
from typing import List

from selenium.common import WebDriverException
from selenium.webdriver.common.options import BaseOptions

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
        platform = sys.platform

        dirs = {
            "darwin": "macos",
            "win32": "windows",
            "cygwin": "windows",
        }

        directory = dirs.get(platform) if dirs.get(platform) else platform

        file = "selenium-manager.exe" if directory == "windows" else "selenium-manager"

        path = Path(__file__).parent.joinpath(directory, file)

        if not path.is_file():
            raise WebDriverException(f"Unable to obtain working Selenium Manager binary; {path}")

        return path

    def driver_location(self, options: BaseOptions) -> str:
        """
        Determines the path of the correct driver.
        :Args:
         - browser: which browser to get the driver path for.
        :Returns: The driver path to use
        """

        logger.debug("Applicable driver not found; attempting to install with Selenium Manager (Beta)")

        browser = options.capabilities["browserName"]

        args = [str(self.get_binary()), "--browser", browser, "--output", "json"]

        if options.browser_version:
            args.append("--browser-version")
            args.append(str(options.browser_version))

        binary_location = getattr(options, "binary_location", None)
        if binary_location:
            args.append("--browser-path")
            args.append(str(binary_location))

        proxy = options.proxy
        if proxy and (proxy.http_proxy or proxy.ssl_proxy):
            args.append("--proxy")
            value = proxy.ssl_proxy if proxy.sslProxy else proxy.http_proxy
            args.append(value)

        if logger.getEffectiveLevel() == logging.DEBUG:
            args.append("--debug")

        result = self.run(args)
        executable = result.split("\t")[-1].strip()
        logger.debug(f"Using driver at: {executable}")
        return executable

    @staticmethod
    def run(args: List[str]) -> str:
        """
        Executes the Selenium Manager Binary.
        :Args:
         - args: the components of the command being executed.
        :Returns: The log string containing the driver location.
        """
        command = " ".join(args)
        logger.debug(f"Executing process: {command}")
        try:
            completed_proc = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout = completed_proc.stdout.decode("utf-8").rstrip("\n")
            stderr = completed_proc.stderr.decode("utf-8").rstrip("\n")
            output = json.loads(stdout)
            result = output["result"]["message"]
        except Exception as err:
            raise WebDriverException(f"Unsuccessful command executed: {command}; {err}")

        if completed_proc.returncode:
            raise WebDriverException(f"Unsuccessful command executed: {command}.\n{result}{stderr}")
        else:
            for item in output["logs"]:
                if item["level"] == "WARN":
                    logger.warning(item["message"])
                if item["level"] == "DEBUG" or item["level"] == "INFO":
                    logger.debug(item["message"])
            return result
