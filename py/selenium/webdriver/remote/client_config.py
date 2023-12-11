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
from urllib import parse

from selenium.webdriver.common.proxy import Proxy
from selenium.webdriver.common.proxy import ProxyType


class ClientConfig:
    def __init__(
        self,
        remote_server_addr: str,
        keep_alive: bool = True,
        proxy=None,
    ) -> None:
        self.remote_server_addr = remote_server_addr
        self.keep_alive = keep_alive
        self.proxy = proxy

    @property
    def remote_server_addr(self) -> str:
        return self._remote_server_addr

    @remote_server_addr.setter
    def remote_server_addr(self, value: str):
        self._remote_server_addr = value

    @property
    def keep_alive(self) -> bool:
        """:Returns: The keep alive value."""
        return self._keep_alive

    @keep_alive.setter
    def keep_alive(self, value: bool) -> None:
        """Toggles the keep alive value.

        :Args:
         - value: whether to keep the http connection alive
        """
        self._keep_alive = value

    @property
    def proxy(self) -> Proxy:
        """:Returns: The proxy used for communicating to the driver/server."""

        self._proxy = self._proxy or Proxy(raw={"proxyType": ProxyType.SYSTEM})
        return self._proxy

    @proxy.setter
    def proxy(self, proxy: Proxy) -> None:
        """Provides the information for communicating with the driver or
        server.

        :Args:
         - value: the proxy information to use to communicate with the driver or server
        """
        self._proxy = proxy

    def get_proxy_url(self):
        if self.proxy.proxy_type == ProxyType.DIRECT:
            return None
        elif self.proxy.proxy_type == ProxyType.SYSTEM:
            _no_proxy = os.environ.get("no_proxy", os.environ.get("NO_PROXY"))
            if _no_proxy:
                for npu in _no_proxy.split(","):
                    npu = npu.strip()
                    if npu == "*":
                        return None
                    n_url = parse.urlparse(npu)
                    remote_add = parse.urlparse(self.remote_server_addr)
                    if n_url.netloc:
                        if remote_add.netloc == n_url.netloc:
                            return None
                    else:
                        if n_url.path in remote_add.netloc:
                            return None
            if self.remote_server_addr.startswith("https://"):
                return os.environ.get("https_proxy", os.environ.get("HTTPS_PROXY"))
            if self.remote_server_addr.startswith("http://"):
                return os.environ.get("http_proxy", os.environ.get("HTTP_PROXY"))
        elif self.proxy.proxy_type == ProxyType.MANUAL:
            if self.remote_server_addr.startswith("https://"):
                return self.proxy.sslProxy
            elif self.remote_server_addr.startswith("http://"):
                return self.proxy.http_proxy
            else:
                return None
        else:
            return None
