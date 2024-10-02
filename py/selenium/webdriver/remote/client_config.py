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
import base64
import os
from urllib import parse

from selenium.webdriver.common.proxy import Proxy
from selenium.webdriver.common.proxy import ProxyType


class ClientConfig:
    def __init__(
        self,
        remote_server_addr: str,
        keep_alive: bool = True,
        proxy: Proxy = Proxy(raw={"proxyType": ProxyType.SYSTEM}),
        username: str = None,
        password: str = None,
        auth_type: str = "Basic",
        token: str = None,
    ) -> None:
        self.remote_server_addr = remote_server_addr
        self.keep_alive = keep_alive
        self.proxy = proxy
        self.username = username
        self.password = password
        self.auth_type = auth_type
        self.token = token

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
        return self._proxy

    @proxy.setter
    def proxy(self, proxy: Proxy) -> None:
        """Provides the information for communicating with the driver or
        server.

        :Args:
         - value: the proxy information to use to communicate with the driver or server
        """
        self._proxy = proxy

    @property
    def username(self) -> str:
        return self._username

    @username.setter
    def username(self, value: str) -> None:
        self._username = value

    @property
    def password(self) -> str:
        return self._password

    @password.setter
    def password(self, value: str) -> None:
        self._password = value

    @property
    def auth_type(self) -> str:
        return self._auth_type

    @auth_type.setter
    def auth_type(self, value: str) -> None:
        self._auth_type = value

    @property
    def token(self) -> str:
        return self._token

    @token.setter
    def token(self, value: str) -> None:
        self._token = value

    def get_proxy_url(self) -> str:
        proxy_type = self.proxy.proxy_type
        remote_add = parse.urlparse(self.remote_server_addr)
        if proxy_type == ProxyType.DIRECT:
            return None
        if proxy_type == ProxyType.SYSTEM:
            _no_proxy = os.environ.get("no_proxy", os.environ.get("NO_PROXY"))
            if _no_proxy:
                for entry in map(str.strip, _no_proxy.split(",")):
                    if entry == "*":
                        return None
                    n_url = parse.urlparse(entry)
                    if n_url.netloc and remote_add.netloc == n_url.netloc:
                        return None
                    if n_url.path in remote_add.netloc:
                        return None
            return os.environ.get(
                "https_proxy" if self.remote_server_addr.startswith("https://") else "http_proxy",
                os.environ.get("HTTPS_PROXY" if self.remote_server_addr.startswith("https://") else "HTTP_PROXY"),
            )
        if proxy_type == ProxyType.MANUAL:
            return self.proxy.sslProxy if self.remote_server_addr.startswith("https://") else self.proxy.http_proxy
        return None

    def get_auth_header(self):
        auth_type = self.auth_type.lower()
        if auth_type == "basic" and self.username and self.password:
            credentials = f"{self.username}:{self.password}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            return {"Authorization": f"Basic {encoded_credentials}"}
        elif auth_type == "bearer" and self.token:
            return {"Authorization": f"Bearer {self.token}"}
        elif auth_type == "oauth" and self.token:
            return {"Authorization": f"OAuth {self.token}"}
        return None
