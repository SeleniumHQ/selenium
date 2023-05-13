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

from selenium.webdriver.common.proxy import Proxy
from selenium.webdriver.common.proxy import ProxyType


class ClientConfig:
    def __init__(
        self, keep_alive: bool = True, timeout=None, proxy=Proxy({"proxyType": ProxyType.SYSTEM}), certificate_path=None
    ) -> None:
        self._keep_alive = keep_alive
        self._timeout = timeout
        self._proxy = proxy
        self._certificate_path = certificate_path

    @property
    def keep_alive(self) -> bool:
        """:Returns: The keep alive value"""
        return self._keep_alive

    @keep_alive.setter
    def keep_alive(self, value: bool) -> None:
        """Toggles the keep alive value.

        :Args:
         - value: whether to keep the http connection alive
        """
        self._keep_alive = value

    @property
    def timeout(self) -> int:
        """:Returns: The amount of time to wait for an http response."""
        return self._timeout

    @timeout.setter
    def timeout(self, time: int) -> None:
        """Sets the amount of time to wait for an http response.

        :Args:
         - value: number of seconds to wait for an http response
        """
        self._timeout = time

    @property
    def proxy(self) -> Proxy:
        """:Returns: The proxy used for communicating to the driver/server"""
        return self._proxy

    @proxy.setter
    def proxy(self, proxy: Proxy) -> None:
        """Provides the information for communicating with the driver or server.

        :Args:
         - value: the proxy information to use to communicate with the driver or server
        """
        self._proxy = proxy

    @property
    def certificate_path(self) -> bool:
        """:Returns: The path of the .pem encoded certificate
        used to verify connection to the driver or server
        """
        return self._certificate_path

    @certificate_path.setter
    def certificate_path(self, path: str) -> None:
        """Set the path to the certificate bundle to verify connection to
        command executor. Can also be set to None to disable certificate
        validation.

        :Args:
            - path - path of a .pem encoded certificate chain.
        """
        self._certificate_path = path
