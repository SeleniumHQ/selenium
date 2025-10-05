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

from collections.abc import Sequence
from typing import Optional

from selenium.types import SubprocessStdAlias
from selenium.webdriver.common import service


class Service(service.Service):
    """Object that manages the starting and stopping of the IEDriver."""

    def __init__(
        self,
        executable_path: Optional[str] = None,
        port: int = 0,
        host: Optional[str] = None,
        service_args: Optional[Sequence[str]] = None,
        log_level: Optional[str] = None,
        log_output: Optional[SubprocessStdAlias] = None,
        driver_path_env_key: Optional[str] = None,
        **kwargs,
    ) -> None:
        """Creates a new instance of the Service.

        :Args:
         - executable_path : Path to the IEDriver
         - port : Port the service is running on
         - host : (Optional) IP address the service port is bound
         - service_args: (Optional) Sequence of args to be passed to the subprocess when launching the executable.
         - log_level : (Optional) Level of logging of service, may be "FATAL", "ERROR", "WARN", "INFO", "DEBUG",
           "TRACE". Default is "FATAL".
         - log_output: (Optional) int representation of STDOUT/DEVNULL, any IO instance or String path to file.
           Default is "stdout".
         - driver_path_env_key: (Optional) Environment variable to use to get the path to the driver executable.
        """
        self._service_args = list(service_args or [])
        driver_path_env_key = driver_path_env_key or "SE_IEDRIVER"

        if host:
            self._service_args.append(f"--host={host}")
        if log_level:
            self._service_args.append(f"--log-level={log_level}")

        super().__init__(
            executable_path=executable_path,
            port=port,
            log_output=log_output,
            driver_path_env_key=driver_path_env_key,
            **kwargs,
        )

    def command_line_args(self) -> list[str]:
        return [f"--port={self.port}"] + self._service_args

    @property
    def service_args(self) -> Sequence[str]:
        return self._service_args

    @service_args.setter
    def service_args(self, value: Sequence[str]):
        if isinstance(value, str) or not isinstance(value, Sequence):
            raise TypeError("service_args must be a sequence")
        self._service_args = list(value)
