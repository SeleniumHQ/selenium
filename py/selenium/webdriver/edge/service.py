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


class Service(service.ChromiumService):

    def __init__(self, executable_path: str, port: int = 0, verbose: bool = False, log_path: str = None,
                 service_args: List[str] = None, env=None):
        """
        Creates a new instance of the EdgeDriver service.
        EdgeDriver provides an interface for Microsoft WebDriver to use
        with Microsoft Edge.

        :Args:
         - executable_path : Path to the Microsoft WebDriver binary.
         - port : Run the remote service on a specified port. Defaults to 0, which binds to a random open port
           of the system's choosing.
         - verbose : Whether to make the webdriver more verbose (passes the --verbose option to the binary).
           Defaults to False.
         - log_path : Optional path for the webdriver binary to log to. Defaults to None which disables logging.
         - service_args : List of args to pass to the WebDriver service.
        """
        self.service_args = service_args or []

        if verbose:
            self.service_args.append("--verbose")

        super(Service, self).__init__(
            executable_path,
            port,
            service_args,
            log_path,
            env,
            "Please download from https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/")
