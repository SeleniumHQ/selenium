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

from typing import List
from selenium.webdriver.chromium import service


DEFAULT_EXECUTABLE_PATH = "chromedriver"


class Service(service.ChromiumService):
    """
    Object that manages the starting and stopping of the ChromeDriver
    """

    def __init__(self, executable_path: str = DEFAULT_EXECUTABLE_PATH,
                 port: int = 0, service_args: List[str] = None,
                 log_path: str = None, env: dict = None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the ChromeDriver
         - port : Port the service is running on
         - service_args : List of args to pass to the chromedriver service
         - log_path : Path for the chromedriver service to log to"""

        super(Service, self).__init__(
            executable_path,
            port,
            service_args,
            log_path,
            env,
            "Please see https://chromedriver.chromium.org/home")
