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

import os
import typing

from selenium.webdriver.common import service, utils
from subprocess import PIPE


class Service(service.Service):
    """
    Object that manages the starting and stopping of the SafariDriver
    """

    def __init__(
        self,
        executable_path: str = "/usr/bin/safaridriver",
        port: int = 0,
        quiet: bool = False,
        reuse_service: bool = False,
        service_args: typing.Optional[typing.MutableSequence[str]] = None,
        start_error_message: str = ""
    ):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the SafariDriver
         - port : Port the service is running on
         - quiet : Suppress driver stdout and stderr
         - service_args : Sequence of args to pass to the safaridriver service"""
        self.reuse_service = reuse_service
        if not os.path.exists(executable_path):
            if "Safari Technology Preview" in executable_path:
                message = "Safari Technology Preview does not seem to be installed. You can download it at https://developer.apple.com/safari/download/."
            else:
                message = "SafariDriver was not found; are you running Safari 10 or later? You can download Safari at https://developer.apple.com/safari/download/."
            raise Exception(message)

        port = port or utils.free_port()
        self.service_args = service_args or []

        self.quiet = quiet
        log = PIPE
        if quiet:
            log = open(os.devnull, "w")
        super().__init__(executable_path, port, log, start_error_message=start_error_message)

    def command_line_args(self):
        return ["-p", "%s" % self.port] + self.service_args

    @property
    def service_url(self):
        """
        Gets the url of the SafariDriver Service
        """
        return "http://localhost:%d" % self.port
