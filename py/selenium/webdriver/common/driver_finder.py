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
import shutil
from pathlib import Path

from selenium.common.exceptions import NoSuchDriverException
from selenium.webdriver.common.options import BaseOptions
from selenium.webdriver.common.selenium_manager import SeleniumManager
from selenium.webdriver.common.service import Service

logger = logging.getLogger(__name__)


class DriverFinder:
    """Utility to find if a given file is present and executable.

    This implementation is still in beta, and may change.
    """

    def __init__(self) -> None:
        pass

    @staticmethod
    def get_path(service: Service, options: BaseOptions) -> str:
        path = shutil.which(service.path)
        try:
            path = SeleniumManager().driver_location(options) if path is None else path
        except Exception as err:
            raise NoSuchDriverException(f"Unable to obtain {service.path} using Selenium Manager; {err}")

        if path is None or not Path(path).is_file():
            raise NoSuchDriverException(f"Unable to locate or obtain {service.path}")

        return path
