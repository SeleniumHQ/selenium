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
import logging
from pathlib import Path

from deprecated import deprecated
from selenium.common.exceptions import NoSuchDriverException
from selenium.webdriver.common.options import BaseOptions
from selenium.webdriver.common.selenium_manager import SeleniumManager
from selenium.webdriver.common.service import Service

logger = logging.getLogger(__name__)


class DriverFinder:
    """Utility to find if a given file is present and executable.

    This implementation is still in beta, and may change.
    """

    @staticmethod
    @deprecated(reason="Use get_results() function instead.")
    def get_path(service: Service, options: BaseOptions) -> str:
        path = service.path
        try:
            path = SeleniumManager().driver_location(options) if path is None else path
        except Exception as err:
            msg = f"Unable to obtain driver for {options.capabilities['browserName']} using Selenium Manager."
            raise NoSuchDriverException(msg) from err

        if path is None or not Path(path).is_file():
            raise NoSuchDriverException(f"Unable to locate or obtain driver for {options.capabilities['browserName']}")

        return path

    @staticmethod
    def get_result(service: Service, options: BaseOptions) -> dict:
        browser = options.capabilities['browserName']
        try:
            path = service.path
            if path:
                logger.debug("Skipping Selenium Manager; path to %s driver specified in Service class: %s", browser, path)
                if not Path(path).is_file():
                    raise ValueError(f"The path is not a valid file: %s", path)
                return {"driver_path": path}
            else:
                output = SeleniumManager().result(DriverFinder._to_args(options))
                results = {}
                if Path(output["driver_path"]).is_file():
                    results["driver_path"] = output["driver_path"]
                else:
                    raise ValueError(f"The driver path is not a valid file: %s", output["driver_path"])
                if Path(output["browser_path"]).is_file():
                    results["browser_path"] = output["browser_path"]
                else:
                    raise ValueError(f"The browser path is not a valid file: %s", output["driver_path"])
                return results
        except Exception as err:
            msg = f"Unable to obtain driver for {browser}"
            raise NoSuchDriverException(msg) from err

    @staticmethod
    def _to_args(options: BaseOptions) -> list:
        args = ["--browser", options.capabilities["browserName"]]

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
            value = proxy.ssl_proxy if proxy.ssl_proxy else proxy.http_proxy
            args.append(value)

        return args
