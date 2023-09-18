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
import typing

from selenium.types import SubprocessStdAlias
from selenium.webdriver.common import service


class Service(service.Service):
    """Object that manages the starting and stopping of the IEDriver."""

    def __init__(
        self,
        executable_path: str = None,
        port: int = 0,
        host: typing.Optional[str] = None,
        service_args: typing.Optional[typing.List[str]] = None,
        log_level: typing.Optional[str] = None,
        log_output: SubprocessStdAlias = None,
        **kwargs,
    ) -> None:
        """Creates a new instance of the Service.

        :Args:
         - executable_path : Path to the IEDriver
         - port : Port the service is running on
         - host : IP address the service port is bound
         - log_level : Level of logging of service, may be "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL".
           Default is "WARNING".
         - log_output: (Optional) int representation of STDOUT/DEVNULL, any IO instance or String path to file.
           Default is "stdout".
        """
        if service_args is None:
            service_args = []
        self._service_args = service_args

        if host:
            self._service_args.append(f"--host-{host}")

        if log_level:
            self._service_args.append(f"--log-level={log_level}")

        super().__init__(
            executable_path,
            port=port,
            log_output=log_output,
            **kwargs,
        )

    @property
    def service_args(self):
        return self._service_args

    @service_args.setter
    def service_args(self, value):
        if not isinstance(value, list):
            raise TypeError("Service args must be a list")
        self._service_args.extend(value)

    def command_line_args(self) -> typing.List[str]:
        return [f"--port={self.port}"] + self._service_args
