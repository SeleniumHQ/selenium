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
import socket
from typing import Optional
from urllib import parse

import certifi

from selenium.webdriver.common.proxy import Proxy
from selenium.webdriver.common.proxy import ProxyType


class ClientConfig:
    def __init__(
        self,
        remote_server_addr: str,
        keep_alive: Optional[bool] = True,
        proxy: Optional[Proxy] = Proxy(raw={"proxyType": ProxyType.SYSTEM}),
        ignore_certificates: Optional[bool] = False,
        init_args_for_pool_manager: Optional[dict] = None,
        timeout: Optional[int] = None,
        ca_certs: Optional[str] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        auth_type: Optional[str] = "Basic",
        token: Optional[str] = None,
    ) -> None:
        self.remote_server_addr = remote_server_addr
        self.keep_alive = keep_alive
        self.proxy = proxy
        self.ignore_certificates = ignore_certificates
        self.init_args_for_pool_manager = init_args_for_pool_manager or {}
        self.timeout = timeout
        self.username = username
        self.password = password
        self.auth_type = auth_type
        self.token = token

        self.timeout = (
            (
                float(os.getenv("GLOBAL_DEFAULT_TIMEOUT", str(socket.getdefaulttimeout())))
                if os.getenv("GLOBAL_DEFAULT_TIMEOUT") is not None
                else socket.getdefaulttimeout()
            )
            if timeout is None
            else timeout
        )

        self.ca_certs = (
            (os.getenv("REQUESTS_CA_BUNDLE") if "REQUESTS_CA_BUNDLE" in os.environ else certifi.where())
            if ca_certs is None
            else ca_certs
        )

    @property
    def remote_server_addr(self) -> str:
        """:Returns: The address of the remote server."""
        return self._remote_server_addr

    @remote_server_addr.setter
    def remote_server_addr(self, value: str) -> None:
        """Provides the address of the remote server."""
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
        For example: Proxy(raw={"proxyType": ProxyType.SYSTEM})

        :Args:
         - value: the proxy information to use to communicate with the driver or server
        """
        self._proxy = proxy

    @property
    def ignore_certificates(self) -> bool:
        """:Returns: The ignore certificate check value."""
        return self._ignore_certificates

    @ignore_certificates.setter
    def ignore_certificates(self, ignore_certificates: bool) -> None:
        """Toggles the ignore certificate check.

        :Args:
         - value: value of ignore certificate check
        """
        self._ignore_certificates = ignore_certificates

    @property
    def init_args_for_pool_manager(self) -> dict:
        """:Returns: The dictionary of arguments will be appended while
        initializing the pool manager."""
        return self._init_args_for_pool_manager

    @init_args_for_pool_manager.setter
    def init_args_for_pool_manager(self, init_args_for_pool_manager: dict) -> None:
        """Provides dictionary of arguments will be appended while initializing the pool manager.
        For example: {"init_args_for_pool_manager": {"retries": 3, "block": True}}

        :Args:
         - value: the dictionary of arguments will be appended while initializing the pool manager
        """
        self._init_args_for_pool_manager = init_args_for_pool_manager

    @property
    def timeout(self) -> int:
        """:Returns: The timeout (in seconds) used for communicating to the
        driver/server."""
        return self._timeout

    @timeout.setter
    def timeout(self, timeout: int) -> None:
        """Provides the timeout (in seconds) for communicating with the driver
        or server.

        :Args:
         - value: the timeout (in seconds) to use to communicate with the driver or server
        """
        self._timeout = timeout

    def reset_timeout(self) -> None:
        """Resets the timeout to the default value of socket."""
        self._timeout = socket.getdefaulttimeout()

    @property
    def ca_certs(self) -> str:
        """:Returns: The path to bundle of CA certificates."""
        return self._ca_certs

    @ca_certs.setter
    def ca_certs(self, ca_certs: str) -> None:
        """Provides the path to bundle of CA certificates for establishing
        secure connections.

        :Args:
         - value: the path to bundle of CA certificates for establishing secure connections
        """
        self._ca_certs = ca_certs

    @property
    def username(self) -> str:
        """Returns the username used for basic authentication to the remote
        server."""
        return self._username

    @username.setter
    def username(self, value: str) -> None:
        """Sets the username used for basic authentication to the remote
        server."""
        self._username = value

    @property
    def password(self) -> str:
        """Returns the password used for basic authentication to the remote
        server."""
        return self._password

    @password.setter
    def password(self, value: str) -> None:
        """Sets the password used for basic authentication to the remote
        server."""
        self._password = value

    @property
    def auth_type(self) -> str:
        """Returns the type of authentication to the remote server."""
        return self._auth_type

    @auth_type.setter
    def auth_type(self, value: str) -> None:
        """Sets the type of authentication to the remote server if it is not
        using basic with username and password."""
        self._auth_type = value

    @property
    def token(self) -> str:
        """Returns the token used for authentication to the remote server."""
        return self._token

    @token.setter
    def token(self, value: str) -> None:
        """Sets the token used for authentication to the remote server if
        auth_type is not basic."""
        self._token = value

    def get_proxy_url(self) -> Optional[str]:
        """Returns the proxy URL to use for the connection."""
        proxy_type = self.proxy.proxy_type
        remote_add = parse.urlparse(self.remote_server_addr)
        if proxy_type is ProxyType.DIRECT:
            return None
        if proxy_type is ProxyType.SYSTEM:
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
        if proxy_type is ProxyType.MANUAL:
            return self.proxy.sslProxy if self.remote_server_addr.startswith("https://") else self.proxy.http_proxy
        return None

    def get_auth_header(self) -> Optional[dict]:
        """Returns the authorization to add to the request headers."""
        auth_type = self.auth_type.lower()
        if auth_type == "basic" and self.username and self.password:
            credentials = f"{self.username}:{self.password}"
            encoded_credentials = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
            return {"Authorization": f"Basic {encoded_credentials}"}
        if auth_type == "bearer" and self.token:
            return {"Authorization": f"Bearer {self.token}"}
        if auth_type == "oauth" and self.token:
            return {"Authorization": f"OAuth {self.token}"}
        return None
