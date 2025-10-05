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

from collections.abc import Mapping, Sequence
from io import IOBase
from typing import Optional

from selenium.types import SubprocessStdAlias
from selenium.webdriver.common import service


class ChromiumService(service.Service):
    """A Service class that is responsible for the starting and stopping the
    WebDriver instance of the ChromiumDriver.

    :param executable_path: install path of the executable.
    :param port: Port for the service to run on, defaults to 0 where the operating system will decide.
    :param service_args: (Optional) Sequence of args to be passed to the subprocess when launching the executable.
    :param log_output: (Optional) int representation of STDOUT/DEVNULL, any IO instance or String path to file.
    :param env: (Optional) Mapping of environment variables for the new process, defaults to `os.environ`.
    :param driver_path_env_key: (Optional) Environment variable to use to get the path to the driver executable.
    """

    def __init__(
        self,
        executable_path: Optional[str] = None,
        port: int = 0,
        service_args: Optional[Sequence[str]] = None,
        log_output: Optional[SubprocessStdAlias] = None,
        env: Optional[Mapping[str, str]] = None,
        driver_path_env_key: Optional[str] = None,
        **kwargs,
    ) -> None:
        self._service_args = list(service_args or [])
        driver_path_env_key = driver_path_env_key or "SE_CHROMEDRIVER"

        if isinstance(log_output, str):
            self._service_args.append(f"--log-path={log_output}")
            self.log_output: Optional[IOBase] = None
        elif isinstance(log_output, IOBase):
            self.log_output = log_output
        else:
            self.log_output = log_output

        super().__init__(
            executable_path=executable_path,
            port=port,
            env=env,
            log_output=self.log_output,
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
