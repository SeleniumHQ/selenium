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
import warnings

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
        log_path: typing.Optional[str] = None,
        reuse_service: bool = False,
        service_args: typing.Optional[typing.MutableSequence[str]] = None,
        env: typing.Optional[typing.Mapping[str, str]] = None,
        start_error_message: str = "",
    ):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the SafariDriver
         - port : Port the service is running on
         - quiet : (Deprecated) Suppress driver stdout and stderr
         - log_path : A log file path to write service output too
         - reuse_service : Do not run the service in a subprocess, instead connect to a running one on the given port
         - service_args : Sequence of args to pass to the safaridriver service when starting the process
         - env : Mapping of additional environment data for the call to subprocess.Popen
         - start_error_message : Custom error message to include when the service fails to start
        """
        self.reuse_service = reuse_service
        self._validate_executable(executable_path)
        port = port or utils.free_port()
        self.service_args = service_args or []

        if quiet:
            warnings.warn(
                "quiet= has been deprecated, please use log_path instead.",
                DeprecationWarning,
                stacklevel=2,
            )
            log_path = log_path or os.devnull

        log = open(log_path, "w") if log_path is not None else PIPE

        super().__init__(
            executable=executable_path,
            port=port,
            log_file=log,
            env=env,
            start_error_message=start_error_message,
        )

    @staticmethod
    def _validate_executable(path: str) -> None:
        """Validate the executable path or raise an exception"""
        download_url = "https://developer.apple.com/safari/download/"
        if not os.path.exists(path):
            if "Safari Technology Preview" in path:
                message = f"Safari Technology Preview is not installed. Download it at {download_url}"
            else:
                message = f"SafariDriver not found.  For Safari 10+ you can download Safari from {download_url}"
            raise Exception(message)

    def start(self):
        """If reuse_service has not been set launch a new subprocess."""
        if not self.reuse_service:
            super().start()

    def stop(self):
        """If reuse_service has not been set, stop the currently running process"""
        if not self.reuse_service:
            super().stop()

    def command_line_args(self) -> typing.List[str]:
        return ["-p", str(self.port)] + self.service_args

    @property
    def service_url(self):
        """
        Gets the url of the SafariDriver Service
        """
        return "http://localhost:%d" % self.port
