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

import logging
import platform
import string
import warnings
from base64 import b64encode
from typing import Optional
from urllib import parse

import urllib3

from selenium import __version__

from . import utils
from .client_config import ClientConfig
from .command import Command
from .errorhandler import ErrorCode

LOGGER = logging.getLogger(__name__)

remote_commands = {
    Command.NEW_SESSION: ("POST", "/session"),
    Command.QUIT: ("DELETE", "/session/$sessionId"),
    Command.W3C_GET_CURRENT_WINDOW_HANDLE: ("GET", "/session/$sessionId/window"),
    Command.W3C_GET_WINDOW_HANDLES: ("GET", "/session/$sessionId/window/handles"),
    Command.GET: ("POST", "/session/$sessionId/url"),
    Command.GO_FORWARD: ("POST", "/session/$sessionId/forward"),
    Command.GO_BACK: ("POST", "/session/$sessionId/back"),
    Command.REFRESH: ("POST", "/session/$sessionId/refresh"),
    Command.W3C_EXECUTE_SCRIPT: ("POST", "/session/$sessionId/execute/sync"),
    Command.W3C_EXECUTE_SCRIPT_ASYNC: ("POST", "/session/$sessionId/execute/async"),
    Command.GET_CURRENT_URL: ("GET", "/session/$sessionId/url"),
    Command.GET_TITLE: ("GET", "/session/$sessionId/title"),
    Command.GET_PAGE_SOURCE: ("GET", "/session/$sessionId/source"),
    Command.SCREENSHOT: ("GET", "/session/$sessionId/screenshot"),
    Command.ELEMENT_SCREENSHOT: ("GET", "/session/$sessionId/element/$id/screenshot"),
    Command.FIND_ELEMENT: ("POST", "/session/$sessionId/element"),
    Command.FIND_ELEMENTS: ("POST", "/session/$sessionId/elements"),
    Command.W3C_GET_ACTIVE_ELEMENT: ("GET", "/session/$sessionId/element/active"),
    Command.FIND_CHILD_ELEMENT: ("POST", "/session/$sessionId/element/$id/element"),
    Command.FIND_CHILD_ELEMENTS: ("POST", "/session/$sessionId/element/$id/elements"),
    Command.CLICK_ELEMENT: ("POST", "/session/$sessionId/element/$id/click"),
    Command.CLEAR_ELEMENT: ("POST", "/session/$sessionId/element/$id/clear"),
    Command.GET_ELEMENT_TEXT: ("GET", "/session/$sessionId/element/$id/text"),
    Command.SEND_KEYS_TO_ELEMENT: ("POST", "/session/$sessionId/element/$id/value"),
    Command.GET_ELEMENT_TAG_NAME: ("GET", "/session/$sessionId/element/$id/name"),
    Command.IS_ELEMENT_SELECTED: ("GET", "/session/$sessionId/element/$id/selected"),
    Command.IS_ELEMENT_ENABLED: ("GET", "/session/$sessionId/element/$id/enabled"),
    Command.GET_ELEMENT_RECT: ("GET", "/session/$sessionId/element/$id/rect"),
    Command.GET_ELEMENT_ATTRIBUTE: ("GET", "/session/$sessionId/element/$id/attribute/$name"),
    Command.GET_ELEMENT_PROPERTY: ("GET", "/session/$sessionId/element/$id/property/$name"),
    Command.GET_ELEMENT_ARIA_ROLE: ("GET", "/session/$sessionId/element/$id/computedrole"),
    Command.GET_ELEMENT_ARIA_LABEL: ("GET", "/session/$sessionId/element/$id/computedlabel"),
    Command.GET_SHADOW_ROOT: ("GET", "/session/$sessionId/element/$id/shadow"),
    Command.FIND_ELEMENT_FROM_SHADOW_ROOT: ("POST", "/session/$sessionId/shadow/$shadowId/element"),
    Command.FIND_ELEMENTS_FROM_SHADOW_ROOT: ("POST", "/session/$sessionId/shadow/$shadowId/elements"),
    Command.GET_ALL_COOKIES: ("GET", "/session/$sessionId/cookie"),
    Command.ADD_COOKIE: ("POST", "/session/$sessionId/cookie"),
    Command.GET_COOKIE: ("GET", "/session/$sessionId/cookie/$name"),
    Command.DELETE_ALL_COOKIES: ("DELETE", "/session/$sessionId/cookie"),
    Command.DELETE_COOKIE: ("DELETE", "/session/$sessionId/cookie/$name"),
    Command.SWITCH_TO_FRAME: ("POST", "/session/$sessionId/frame"),
    Command.SWITCH_TO_PARENT_FRAME: ("POST", "/session/$sessionId/frame/parent"),
    Command.SWITCH_TO_WINDOW: ("POST", "/session/$sessionId/window"),
    Command.NEW_WINDOW: ("POST", "/session/$sessionId/window/new"),
    Command.CLOSE: ("DELETE", "/session/$sessionId/window"),
    Command.GET_ELEMENT_VALUE_OF_CSS_PROPERTY: ("GET", "/session/$sessionId/element/$id/css/$propertyName"),
    Command.EXECUTE_ASYNC_SCRIPT: ("POST", "/session/$sessionId/execute_async"),
    Command.SET_TIMEOUTS: ("POST", "/session/$sessionId/timeouts"),
    Command.GET_TIMEOUTS: ("GET", "/session/$sessionId/timeouts"),
    Command.W3C_DISMISS_ALERT: ("POST", "/session/$sessionId/alert/dismiss"),
    Command.W3C_ACCEPT_ALERT: ("POST", "/session/$sessionId/alert/accept"),
    Command.W3C_SET_ALERT_VALUE: ("POST", "/session/$sessionId/alert/text"),
    Command.W3C_GET_ALERT_TEXT: ("GET", "/session/$sessionId/alert/text"),
    Command.W3C_ACTIONS: ("POST", "/session/$sessionId/actions"),
    Command.W3C_CLEAR_ACTIONS: ("DELETE", "/session/$sessionId/actions"),
    Command.SET_WINDOW_RECT: ("POST", "/session/$sessionId/window/rect"),
    Command.GET_WINDOW_RECT: ("GET", "/session/$sessionId/window/rect"),
    Command.W3C_MAXIMIZE_WINDOW: ("POST", "/session/$sessionId/window/maximize"),
    Command.SET_SCREEN_ORIENTATION: ("POST", "/session/$sessionId/orientation"),
    Command.GET_SCREEN_ORIENTATION: ("GET", "/session/$sessionId/orientation"),
    Command.GET_NETWORK_CONNECTION: ("GET", "/session/$sessionId/network_connection"),
    Command.SET_NETWORK_CONNECTION: ("POST", "/session/$sessionId/network_connection"),
    Command.GET_LOG: ("POST", "/session/$sessionId/se/log"),
    Command.GET_AVAILABLE_LOG_TYPES: ("GET", "/session/$sessionId/se/log/types"),
    Command.CURRENT_CONTEXT_HANDLE: ("GET", "/session/$sessionId/context"),
    Command.CONTEXT_HANDLES: ("GET", "/session/$sessionId/contexts"),
    Command.SWITCH_TO_CONTEXT: ("POST", "/session/$sessionId/context"),
    Command.FULLSCREEN_WINDOW: ("POST", "/session/$sessionId/window/fullscreen"),
    Command.MINIMIZE_WINDOW: ("POST", "/session/$sessionId/window/minimize"),
    Command.PRINT_PAGE: ("POST", "/session/$sessionId/print"),
    Command.ADD_VIRTUAL_AUTHENTICATOR: ("POST", "/session/$sessionId/webauthn/authenticator"),
    Command.REMOVE_VIRTUAL_AUTHENTICATOR: (
        "DELETE",
        "/session/$sessionId/webauthn/authenticator/$authenticatorId",
    ),
    Command.ADD_CREDENTIAL: ("POST", "/session/$sessionId/webauthn/authenticator/$authenticatorId/credential"),
    Command.GET_CREDENTIALS: ("GET", "/session/$sessionId/webauthn/authenticator/$authenticatorId/credentials"),
    Command.REMOVE_CREDENTIAL: (
        "DELETE",
        "/session/$sessionId/webauthn/authenticator/$authenticatorId/credentials/$credentialId",
    ),
    Command.REMOVE_ALL_CREDENTIALS: (
        "DELETE",
        "/session/$sessionId/webauthn/authenticator/$authenticatorId/credentials",
    ),
    Command.SET_USER_VERIFIED: ("POST", "/session/$sessionId/webauthn/authenticator/$authenticatorId/uv"),
    Command.UPLOAD_FILE: ("POST", "/session/$sessionId/se/file"),
    Command.GET_DOWNLOADABLE_FILES: ("GET", "/session/$sessionId/se/files"),
    Command.DOWNLOAD_FILE: ("POST", "/session/$sessionId/se/files"),
    Command.DELETE_DOWNLOADABLE_FILES: ("DELETE", "/session/$sessionId/se/files"),
}


class RemoteConnection:
    """A connection with the Remote WebDriver server.

    Communicates with the server using the WebDriver wire protocol:
    https://github.com/SeleniumHQ/selenium/wiki/JsonWireProtocol
    """

    browser_name = None
    _client_config: ClientConfig = None

    system = platform.system().lower()
    if system == "darwin":
        system = "mac"

    # Class variables for headers
    extra_headers = None
    user_agent = f"selenium/{__version__} (python {system})"

    @classmethod
    def get_timeout(cls):
        """:Returns:

        Timeout value in seconds for all http requests made to the
        Remote Connection
        """
        warnings.warn(
            "get_timeout() in RemoteConnection is deprecated, get timeout from ClientConfig instance instead",
            DeprecationWarning,
            stacklevel=2,
        )
        return cls._client_config.timeout

    @classmethod
    def set_timeout(cls, timeout):
        """Override the default timeout.

        :Args:
            - timeout - timeout value for http requests in seconds
        """
        warnings.warn(
            "set_timeout() in RemoteConnection is deprecated, set timeout to ClientConfig instance in constructor instead",
            DeprecationWarning,
            stacklevel=2,
        )
        cls._client_config.timeout = timeout

    @classmethod
    def reset_timeout(cls):
        """Reset the http request timeout to socket._GLOBAL_DEFAULT_TIMEOUT."""
        warnings.warn(
            "reset_timeout() in RemoteConnection is deprecated, use reset_timeout() in ClientConfig instance instead",
            DeprecationWarning,
            stacklevel=2,
        )
        cls._client_config.reset_timeout()

    @classmethod
    def get_certificate_bundle_path(cls):
        """:Returns:

        Paths of the .pem encoded certificate to verify connection to
        command executor. Defaults to certifi.where() or
        REQUESTS_CA_BUNDLE env variable if set.
        """
        warnings.warn(
            "get_certificate_bundle_path() in RemoteConnection is deprecated, get ca_certs from ClientConfig instance instead",
            DeprecationWarning,
            stacklevel=2,
        )
        return cls._client_config.ca_certs

    @classmethod
    def set_certificate_bundle_path(cls, path):
        """Set the path to the certificate bundle to verify connection to
        command executor. Can also be set to None to disable certificate
        validation.

        :Args:
            - path - path of a .pem encoded certificate chain.
        """
        warnings.warn(
            "set_certificate_bundle_path() in RemoteConnection is deprecated, set ca_certs to ClientConfig instance in constructor instead",
            DeprecationWarning,
            stacklevel=2,
        )
        cls._client_config.ca_certs = path

    @classmethod
    def get_remote_connection_headers(cls, parsed_url, keep_alive=False):
        """Get headers for remote request.

        :Args:
         - parsed_url - The parsed url
         - keep_alive (Boolean) - Is this a keep-alive connection (default: False)
        """

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent": cls.user_agent,
        }

        if parsed_url.username:
            base64string = b64encode(f"{parsed_url.username}:{parsed_url.password}".encode())
            headers.update({"Authorization": f"Basic {base64string.decode()}"})

        if keep_alive:
            headers.update({"Connection": "keep-alive"})

        if cls.extra_headers:
            headers.update(cls.extra_headers)

        return headers

    def _identify_http_proxy_auth(self):
        url = self._proxy_url
        url = url[url.find(":") + 3 :]
        return "@" in url and len(url[: url.find("@")]) > 0

    def _separate_http_proxy_auth(self):
        url = self._proxy_url
        protocol = url[: url.find(":") + 3]
        no_protocol = url[len(protocol) :]
        auth = no_protocol[: no_protocol.find("@")]
        proxy_without_auth = protocol + no_protocol[len(auth) + 1 :]
        return proxy_without_auth, auth

    def _get_connection_manager(self):
        pool_manager_init_args = {"timeout": self._client_config.timeout}
        pool_manager_init_args.update(
            self._client_config.init_args_for_pool_manager.get("init_args_for_pool_manager", {})
        )

        if self._client_config.ignore_certificates:
            pool_manager_init_args["cert_reqs"] = "CERT_NONE"
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        elif self._client_config.ca_certs:
            pool_manager_init_args["cert_reqs"] = "CERT_REQUIRED"
            pool_manager_init_args["ca_certs"] = self._client_config.ca_certs

        if self._proxy_url:
            if self._proxy_url.lower().startswith("sock"):
                from urllib3.contrib.socks import SOCKSProxyManager

                return SOCKSProxyManager(self._proxy_url, **pool_manager_init_args)
            if self._identify_http_proxy_auth():
                self._proxy_url, self._basic_proxy_auth = self._separate_http_proxy_auth()
                pool_manager_init_args["proxy_headers"] = urllib3.make_headers(proxy_basic_auth=self._basic_proxy_auth)
            return urllib3.ProxyManager(self._proxy_url, **pool_manager_init_args)

        return urllib3.PoolManager(**pool_manager_init_args)

    def __init__(
        self,
        remote_server_addr: Optional[str] = None,
        keep_alive: Optional[bool] = True,
        ignore_proxy: Optional[bool] = False,
        ignore_certificates: Optional[bool] = False,
        init_args_for_pool_manager: Optional[dict] = None,
        client_config: Optional[ClientConfig] = None,
    ):
        self._client_config = client_config or ClientConfig(
            remote_server_addr=remote_server_addr,
            keep_alive=keep_alive,
            ignore_certificates=ignore_certificates,
            init_args_for_pool_manager=init_args_for_pool_manager,
        )

        RemoteConnection._client_config = self._client_config

        if remote_server_addr:
            warnings.warn(
                "setting remote_server_addr in RemoteConnection() is deprecated, set in ClientConfig instance instead",
                DeprecationWarning,
                stacklevel=2,
            )

        if not keep_alive:
            warnings.warn(
                "setting keep_alive in RemoteConnection() is deprecated, set in ClientConfig instance instead",
                DeprecationWarning,
                stacklevel=2,
            )

        if ignore_certificates:
            warnings.warn(
                "setting ignore_certificates in RemoteConnection() is deprecated, set in ClientConfig instance instead",
                DeprecationWarning,
                stacklevel=2,
            )

        if init_args_for_pool_manager:
            warnings.warn(
                "setting init_args_for_pool_manager in RemoteConnection() is deprecated, set in ClientConfig instance instead",
                DeprecationWarning,
                stacklevel=2,
            )

        if ignore_proxy:
            warnings.warn(
                "setting ignore_proxy in RemoteConnection() is deprecated, set in ClientConfig instance instead",
                DeprecationWarning,
                stacklevel=2,
            )
            self._proxy_url = None
        else:
            self._proxy_url = self._client_config.get_proxy_url()

        if self._client_config.keep_alive:
            self._conn = self._get_connection_manager()
        self._commands = remote_commands

    extra_commands = {}

    def add_command(self, name, method, url):
        """Register a new command."""
        self._commands[name] = (method, url)

    def get_command(self, name: str):
        """Retrieve a command if it exists."""
        return self._commands.get(name)

    def execute(self, command, params):
        """Send a command to the remote server.

        Any path substitutions required for the URL mapped to the command should be
        included in the command parameters.

        :Args:
         - command - A string specifying the command to execute.
         - params - A dictionary of named parameters to send with the command as
           its JSON payload.
        """
        command_info = self._commands.get(command) or self.extra_commands.get(command)
        assert command_info is not None, f"Unrecognised command {command}"
        path_string = command_info[1]
        path = string.Template(path_string).substitute(params)
        substitute_params = {word[1:] for word in path_string.split("/") if word.startswith("$")}  # remove dollar sign
        if isinstance(params, dict) and substitute_params:
            for word in substitute_params:
                del params[word]
        data = utils.dump_json(params)
        url = f"{self._client_config.remote_server_addr}{path}"
        trimmed = self._trim_large_entries(params)
        LOGGER.debug("%s %s %s", command_info[0], url, str(trimmed))
        return self._request(command_info[0], url, body=data)

    def _request(self, method, url, body=None, timeout=120):
        """Send an HTTP request to the remote server.

        :Args:
         - method - A string for the HTTP method to send the request with.
         - url - A string for the URL to send the request to.
         - body - A string for request body. Ignored unless method is POST or PUT.

        :Returns:
          A dictionary with the server's parsed JSON response.
        """
        parsed_url = parse.urlparse(url)
        headers = self.get_remote_connection_headers(parsed_url, self._client_config.keep_alive)
        auth_header = self._client_config.get_auth_header()

        if auth_header:
            headers.update(auth_header)

        if body and method not in ("POST", "PUT"):
            body = None

        if self._client_config.keep_alive:
            response = self._conn.request(method, url, body=body, headers=headers, timeout=timeout)
            statuscode = response.status
        else:
            conn = self._get_connection_manager()
            with conn as http:
                response = http.request(method, url, body=body, headers=headers, timeout=timeout)
            statuscode = response.status
        data = response.data.decode("UTF-8")
        LOGGER.debug("Remote response: status=%s | data=%s | headers=%s", response.status, data, response.headers)
        try:
            if 300 <= statuscode < 304:
                return self._request("GET", response.headers.get("location", None))
            if 399 < statuscode <= 500:
                if statuscode == 401:
                    return {"status": statuscode, "value": "Authorization Required"}
                return {"status": statuscode, "value": str(statuscode) if not data else data.strip()}
            content_type = []
            if response.headers.get("Content-Type", None):
                content_type = response.headers.get("Content-Type", None).split(";")
            if not any([x.startswith("image/png") for x in content_type]):
                try:
                    data = utils.load_json(data.strip())
                except ValueError:
                    if 199 < statuscode < 300:
                        status = ErrorCode.SUCCESS
                    else:
                        status = ErrorCode.UNKNOWN_ERROR
                    return {"status": status, "value": data.strip()}

                # Some drivers incorrectly return a response
                # with no 'value' field when they should return null.
                if "value" not in data:
                    data["value"] = None
                return data
            data = {"status": 0, "value": data}
            return data
        finally:
            LOGGER.debug("Finished Request")
            response.close()

    def close(self):
        """Clean up resources when finished with the remote_connection."""
        if hasattr(self, "_conn"):
            self._conn.clear()

    def _trim_large_entries(self, input_dict, max_length=100):
        """Truncate string values in a dictionary if they exceed max_length.

        :param dict: Dictionary with potentially large values
        :param max_length: Maximum allowed length of string values
        :return: Dictionary with truncated string values
        """
        output_dictionary = {}
        for key, value in input_dict.items():
            if isinstance(value, dict):
                output_dictionary[key] = self._trim_large_entries(value, max_length)
            elif isinstance(value, str) and len(value) > max_length:
                output_dictionary[key] = value[:max_length] + "..."
            else:
                output_dictionary[key] = value

        return output_dictionary
