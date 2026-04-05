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

"""APIRequestContext for making HTTP requests with browser cookie synchronization."""

import json
import logging
import pathlib
import time
import urllib.parse
from email.utils import parsedate_to_datetime
from http.client import responses as http_status_phrases
from typing import TYPE_CHECKING, Any

import urllib3
from urllib3.util.retry import Retry

if TYPE_CHECKING:
    from selenium.webdriver.remote.webdriver import WebDriver

logger = logging.getLogger(__name__)


class APIRequestFailure(Exception):
    """Raised when an API request returns a non-2xx status and fail_on_status_code is True.

    Attributes:
        response: The APIResponse that triggered the failure.
    """

    def __init__(self, response: "APIResponse") -> None:
        self.response = response
        super().__init__(f"{response.status} {response.status_text}: {response.url}")


class APIResponse:
    """Represents an HTTP response from an API request.

    Attributes:
        status: HTTP status code.
        status_text: HTTP status text.
        headers: Response headers as a dict.
        url: The request URL.
    """

    def __init__(self, status: int, status_text: str, headers: dict[str, str], url: str, body: bytes) -> None:
        self.status = status
        self.status_text = status_text
        self.headers = headers
        self.url = url
        self._body = body

    @property
    def ok(self) -> bool:
        """Whether the response status is in the 200-299 range."""
        return 200 <= self.status <= 299

    def json(self) -> Any:
        """Parse the response body as JSON.

        Returns:
            The parsed JSON object.
        """
        return json.loads(self._body)

    def text(self) -> str:
        """Decode the response body as UTF-8 text.

        Returns:
            The response body as a string.
        """
        return self._body.decode("utf-8")

    def body(self) -> bytes:
        """Return the raw response body bytes.

        Returns:
            The response body as bytes.
        """
        return self._body

    def dispose(self) -> None:
        """Free the response body memory."""
        self._body = b""


def _cookie_matches(cookie: dict, url: str, default_domain: str = "") -> bool:
    """Check if a browser cookie should be sent with a request to the given URL.

    Evaluates expiry, domain, path, and secure attribute matching per RFC 6265.

    Args:
        cookie: A cookie dict from driver.get_cookies().
        url: The target request URL.
        default_domain: Fallback domain for host-only cookies (no domain attribute).
            When a cookie has no domain, it only matches if the request hostname
            equals this value. If empty and cookie has no domain, the cookie is skipped.

    Returns:
        True if the cookie matches the URL.
    """
    # Expiry check — skip expired cookies
    expiry = cookie.get("expiry")
    if expiry is not None and expiry <= int(time.time()):
        return False

    parsed = urllib.parse.urlparse(url)
    hostname = parsed.hostname or ""
    path = parsed.path or "/"
    scheme = parsed.scheme or "http"

    # Domain matching (RFC 6265 section 5.1.3)
    cookie_domain = cookie.get("domain", "")
    if not cookie_domain:
        # Host-only cookie — must match the origin host exactly
        if not default_domain or hostname != default_domain:
            return False
    elif cookie_domain.startswith("."):
        # .example.com matches example.com and sub.example.com
        if not (hostname == cookie_domain[1:] or hostname.endswith(cookie_domain)):
            return False
    else:
        if hostname != cookie_domain:
            return False

    # Path matching (RFC 6265 section 5.1.4)
    cookie_path = cookie.get("path", "/")
    if cookie_path == "/":
        pass  # root path matches everything
    elif path != cookie_path and not path.startswith(cookie_path + "/"):
        return False

    # Secure matching
    if cookie.get("secure", False) and scheme != "https":
        return False

    return True


def _parse_set_cookie(header_value: str) -> dict:
    """Parse a single Set-Cookie header value into a cookie dict.

    Uses manual parsing instead of http.cookies.SimpleCookie which is too
    strict for real-world Set-Cookie headers.

    Args:
        header_value: The Set-Cookie header string.

    Returns:
        A dict with cookie attributes suitable for driver.add_cookie().
    """
    parts = header_value.split(";")
    name_value = parts[0].strip()
    eq_idx = name_value.find("=")
    if eq_idx == -1:
        return {}
    name = name_value[:eq_idx].strip()
    value = name_value[eq_idx + 1 :].strip()

    cookie: dict[str, Any] = {"name": name, "value": value}
    has_max_age = False

    for part in parts[1:]:
        part = part.strip()
        if not part:
            continue
        if "=" in part:
            attr_name, attr_value = part.split("=", 1)
            attr_name = attr_name.strip().lower()
            attr_value = attr_value.strip()
        else:
            attr_name = part.strip().lower()
            attr_value = ""

        if attr_name == "domain":
            cookie["domain"] = attr_value
        elif attr_name == "path":
            cookie["path"] = attr_value
        elif attr_name == "secure":
            cookie["secure"] = True
        elif attr_name == "httponly":
            cookie["httpOnly"] = True
        elif attr_name == "samesite":
            cookie["sameSite"] = attr_value
        elif attr_name == "max-age":
            try:
                max_age = int(attr_value)
                cookie["expiry"] = int(time.time()) + max_age
                has_max_age = True
            except ValueError:
                pass
        elif attr_name == "expires" and not has_max_age:
            # RFC 6265 §5.3: Max-Age takes precedence over Expires
            try:
                dt = parsedate_to_datetime(attr_value)
                cookie["expiry"] = int(dt.timestamp())
            except (ValueError, TypeError):
                pass

    return cookie


def _get_set_cookie_headers(resp: urllib3.BaseHTTPResponse) -> list[str]:
    """Extract all Set-Cookie header values from a urllib3 response.

    Args:
        resp: The urllib3 HTTP response.

    Returns:
        A list of Set-Cookie header strings.
    """
    if hasattr(resp.headers, "getlist"):
        headers = resp.headers.getlist("Set-Cookie")
        if headers:
            return headers
    sc = resp.headers.get("Set-Cookie")
    return [sc] if sc else []


def _resolve_redirect_url(resp: urllib3.BaseHTTPResponse, original_url: str) -> str:
    """Return the final URL after any redirects.

    urllib3's retry history records each hop.  When redirects occurred,
    the last entry's redirect_location resolved against its URL gives
    the final destination.  When no redirects occurred, the original
    request URL is returned unchanged.
    """
    history = resp.retries.history if resp.retries else ()
    if history:
        last = history[-1]
        if last.url and last.redirect_location:
            return urllib.parse.urljoin(last.url, last.redirect_location)
    return original_url


class _BaseRequestContext:
    """Base class with shared HTTP request logic for API request contexts."""

    def __init__(
        self,
        base_url: str = "",
        extra_headers: dict[str, str] | None = None,
        timeout: float = 30.0,
        max_redirects: int = 10,
        fail_on_status_code: bool = False,
    ) -> None:
        self._base_url = base_url
        self._extra_headers = extra_headers or {}
        self._timeout = timeout
        self._max_redirects = max_redirects
        self._fail_on_status_code = fail_on_status_code
        self._pool = urllib3.PoolManager()

    def get(self, url: str, **kwargs: Any) -> APIResponse:
        """Send a GET request.

        Args:
            url: The request URL (absolute or relative to base_url).
            **kwargs: Optional arguments: headers, params, timeout, max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, "GET", **kwargs)

    def post(self, url: str, **kwargs: Any) -> APIResponse:
        """Send a POST request.

        Args:
            url: The request URL (absolute or relative to base_url).
            **kwargs: Optional arguments: headers, params, data, form,
                json_data, timeout, max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, "POST", **kwargs)

    def put(self, url: str, **kwargs: Any) -> APIResponse:
        """Send a PUT request.

        Args:
            url: The request URL (absolute or relative to base_url).
            **kwargs: Optional arguments: headers, params, data, form,
                json_data, timeout, max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, "PUT", **kwargs)

    def patch(self, url: str, **kwargs: Any) -> APIResponse:
        """Send a PATCH request.

        Args:
            url: The request URL (absolute or relative to base_url).
            **kwargs: Optional arguments: headers, params, data, form,
                json_data, timeout, max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, "PATCH", **kwargs)

    def delete(self, url: str, **kwargs: Any) -> APIResponse:
        """Send a DELETE request.

        Args:
            url: The request URL (absolute or relative to base_url).
            **kwargs: Optional arguments: headers, params, data, form,
                json_data, timeout, max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, "DELETE", **kwargs)

    def head(self, url: str, **kwargs: Any) -> APIResponse:
        """Send a HEAD request.

        Args:
            url: The request URL (absolute or relative to base_url).
            **kwargs: Optional arguments: headers, params, timeout,
                max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, "HEAD", **kwargs)

    def fetch(self, url: str, method: str = "GET", **kwargs: Any) -> APIResponse:
        """Send an HTTP request with a custom method.

        Args:
            url: The request URL (absolute or relative to base_url).
            method: The HTTP method to use.
            **kwargs: Optional arguments: headers, params, data, form,
                json_data, timeout, max_redirects, fail_on_status_code.

        Returns:
            An APIResponse object.
        """
        return self._fetch(url, method, **kwargs)

    def dispose(self) -> None:
        """Close the underlying connection pool."""
        self._pool.clear()

    def _resolve_url(self, url: str) -> str:
        """Resolve a URL, prepending base_url for relative paths."""
        if not url.startswith(("http://", "https://")):
            return self._base_url.rstrip("/") + "/" + url.lstrip("/")
        return url

    def _build_headers(self, kwargs: dict[str, Any]) -> dict[str, str]:
        """Merge extra_headers with per-request headers."""
        headers = dict(self._extra_headers)
        if kwargs.get("headers"):
            headers.update(kwargs["headers"])
        return headers

    def _prepare_body(self, headers: dict[str, str], kwargs: dict[str, Any]) -> bytes | None:
        """Prepare the request body from json_data, form, or data kwargs.

        Priority: json_data > form > data. Only one should be provided.
        """
        json_data = kwargs.get("json_data")
        form = kwargs.get("form")
        data = kwargs.get("data")

        if json_data is not None:
            headers.setdefault("Content-Type", "application/json")
            return json.dumps(json_data).encode("utf-8")
        elif form is not None:
            headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
            return urllib.parse.urlencode(form).encode("utf-8")
        elif data is not None:
            if isinstance(data, dict):
                headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
                return urllib.parse.urlencode(data).encode("utf-8")
            elif isinstance(data, str):
                return data.encode("utf-8")
            elif isinstance(data, bytes):
                return data
        return None

    def _append_params(self, url: str, kwargs: dict[str, Any]) -> str:
        """Append query parameters to the URL."""
        params = kwargs.get("params")
        if params:
            separator = "&" if "?" in url else "?"
            return url + separator + urllib.parse.urlencode(params)
        return url

    def _execute_request(
        self, method: str, url: str, headers: dict[str, str], body: bytes | None, kwargs: dict[str, Any]
    ) -> urllib3.BaseHTTPResponse:
        """Execute the HTTP request via urllib3."""
        timeout = kwargs.get("timeout", self._timeout)
        max_redirects = kwargs.get("max_redirects", self._max_redirects)

        follow = max_redirects > 0
        retries = Retry(
            connect=0,
            read=0,
            status=0,
            other=0,
            redirect=max_redirects if follow else 0,
            raise_on_redirect=False,
        )

        return self._pool.request(
            method,
            url,
            headers=headers,
            body=body,
            timeout=timeout,
            redirect=follow,
            retries=retries,
            preload_content=True,
        )

    def _build_response(self, resp: urllib3.BaseHTTPResponse, url: str) -> APIResponse:
        """Build an APIResponse from a urllib3 response."""
        # Merge duplicate headers per RFC 7230 §3.2.2 (combine with ", ")
        resp_headers: dict[str, str] = {}
        for k, v in resp.headers.items():
            key = k.lower()
            if key in resp_headers:
                resp_headers[key] = resp_headers[key] + ", " + v
            else:
                resp_headers[key] = v
        # urllib3 2.x removed resp.reason; fall back to stdlib phrase lookup
        reason = getattr(resp, "reason", None)
        status_text = reason or http_status_phrases.get(resp.status, "")
        return APIResponse(
            status=resp.status,
            status_text=status_text,
            headers=resp_headers,
            url=url,
            body=resp.data,
        )

    def _get_cookies_for_request(self, url: str) -> list[dict]:
        """Get cookies that should be sent with the request. Overridden by subclasses."""
        return []

    def _handle_response_cookies(self, set_cookie_headers: list[str], url: str) -> None:
        """Process Set-Cookie headers from the response. Overridden by subclasses."""

    def _fetch(self, url: str, method: str, **kwargs: Any) -> APIResponse:
        """Execute an HTTP request with cookie handling.

        Args:
            url: The request URL.
            method: The HTTP method.
            **kwargs: Optional arguments.

        Returns:
            An APIResponse object.
        """
        url = self._resolve_url(url)
        headers = self._build_headers(kwargs)

        # Apply cookies
        matching_cookies = self._get_cookies_for_request(url)
        if matching_cookies:
            cookie_header = "; ".join(f"{c['name']}={c['value']}" for c in matching_cookies)
            if "Cookie" in headers:
                headers["Cookie"] = headers["Cookie"] + "; " + cookie_header
            else:
                headers["Cookie"] = cookie_header

        body = self._prepare_body(headers, kwargs)
        url = self._append_params(url, kwargs)
        resp = self._execute_request(method, url, headers, body, kwargs)

        # After redirects, associate cookies with the final destination's
        # origin, not the initial request URL.
        final_url = _resolve_redirect_url(resp, url)

        # Process response cookies
        set_cookie_headers = _get_set_cookie_headers(resp)
        if set_cookie_headers:
            self._handle_response_cookies(set_cookie_headers, final_url)

        response = self._build_response(resp, final_url)

        fail = kwargs.get("fail_on_status_code", self._fail_on_status_code)
        if fail and not response.ok:
            raise APIRequestFailure(response)

        return response


class APIRequestContext(_BaseRequestContext):
    """Makes HTTP requests with automatic browser cookie synchronization.

    Cookies from the browser session are sent with API requests, and cookies
    from API responses are synced back to the browser.

    Args:
        driver: The WebDriver instance to sync cookies with.
        base_url: Optional base URL prepended to relative request paths.
        extra_headers: Optional headers included in every request.
        timeout: Default request timeout in seconds.
        max_redirects: Maximum number of redirects to follow.
        fail_on_status_code: If True, raise APIRequestFailure for non-2xx responses.
    """

    def __init__(
        self,
        driver: "WebDriver",
        base_url: str = "",
        extra_headers: dict[str, str] | None = None,
        timeout: float = 30.0,
        max_redirects: int = 10,
        fail_on_status_code: bool = False,
    ) -> None:
        super().__init__(
            base_url=base_url,
            extra_headers=extra_headers,
            timeout=timeout,
            max_redirects=max_redirects,
            fail_on_status_code=fail_on_status_code,
        )
        self._driver = driver

    def new_context(
        self,
        base_url: str = "",
        extra_headers: dict[str, str] | None = None,
        storage_state: dict | str | pathlib.Path | None = None,
        fail_on_status_code: bool = False,
    ) -> "_IsolatedAPIRequestContext":
        """Create an isolated API request context that does not sync with the browser.

        Args:
            base_url: Optional base URL for this context.
            extra_headers: Optional headers for this context.
            storage_state: Optional cookies to pre-load, as a dict, JSON file path, or Path.
            fail_on_status_code: If True, raise APIRequestFailure for non-2xx responses.

        Returns:
            An _IsolatedAPIRequestContext instance.
        """
        cookies: list[dict] = []
        if storage_state is not None:
            if isinstance(storage_state, (str, pathlib.Path)):
                file_path = pathlib.Path(storage_state)
                if not file_path.exists():
                    raise FileNotFoundError(f"Storage state file not found: {file_path}")
                try:
                    with open(file_path) as f:
                        state = json.load(f)
                except json.JSONDecodeError as e:
                    raise ValueError(f"Invalid JSON in storage state file {file_path}: {e}") from e
                except OSError as e:
                    raise OSError(f"Cannot read storage state file {file_path}: {e}") from e
            else:
                state = storage_state
            cookies = list(state.get("cookies", []))

        return _IsolatedAPIRequestContext(
            base_url=base_url,
            extra_headers=extra_headers,
            cookies=cookies,
            timeout=self._timeout,
            max_redirects=self._max_redirects,
            fail_on_status_code=fail_on_status_code,
        )

    def get_storage_state(self, path: str | pathlib.Path | None = None) -> dict[str, Any]:
        """Export the current browser cookies as a storage state dict.

        Args:
            path: Optional file path to save the storage state as JSON.

        Returns:
            A dict with a "cookies" key containing the browser cookies.
        """
        cookies = self._driver.get_cookies()
        state: dict[str, Any] = {"cookies": cookies}
        if path is not None:
            file_path = pathlib.Path(path)
            try:
                with open(file_path, "w") as f:
                    json.dump(state, f, indent=2)
            except OSError as e:
                raise OSError(f"Cannot write storage state to {file_path}: {e}") from e
        return state

    def _get_cookies_for_request(self, url: str) -> list[dict]:
        """Get matching browser cookies for the request URL."""
        try:
            browser_cookies = self._driver.get_cookies()
        except Exception:
            logger.debug("Could not retrieve browser cookies", exc_info=True)
            return []
        # Derive default domain from the browser's current page for host-only cookies
        default_domain = ""
        try:
            current = self._driver.current_url
            if current:
                default_domain = urllib.parse.urlparse(current).hostname or ""
        except Exception:
            logger.debug("Could not get current URL for host-only cookie matching", exc_info=True)
        return [c for c in browser_cookies if _cookie_matches(c, url, default_domain)]

    def _handle_response_cookies(self, set_cookie_headers: list[str], url: str) -> None:
        """Sync Set-Cookie headers back to the browser."""
        parsed_url = urllib.parse.urlparse(url)
        for sc_header in set_cookie_headers:
            cookie = _parse_set_cookie(sc_header)
            if not cookie.get("name"):
                continue
            cookie.setdefault("domain", parsed_url.hostname or "")
            cookie.setdefault("path", "/")
            expiry = cookie.get("expiry")
            if expiry is not None and expiry <= int(time.time()):
                try:
                    self._driver.delete_cookie(cookie["name"])
                except Exception:
                    pass
                continue
            try:
                self._driver.add_cookie(cookie)
            except Exception:
                logger.warning(
                    "Could not sync cookie '%s' to browser (domain mismatch with current page)",
                    cookie.get("name"),
                    exc_info=True,
                )


class _IsolatedAPIRequestContext(_BaseRequestContext):
    """An isolated API request context that maintains its own cookie jar.

    Does not synchronize cookies with any browser session.
    """

    def __init__(
        self,
        base_url: str = "",
        extra_headers: dict[str, str] | None = None,
        cookies: list[dict] | None = None,
        timeout: float = 30.0,
        max_redirects: int = 10,
        fail_on_status_code: bool = False,
    ) -> None:
        super().__init__(
            base_url=base_url,
            extra_headers=extra_headers,
            timeout=timeout,
            max_redirects=max_redirects,
            fail_on_status_code=fail_on_status_code,
        )
        self._cookies: list[dict] = cookies or []

    def get_storage_state(self) -> dict[str, Any]:
        """Return the current cookies as a storage state dict."""
        return {"cookies": list(self._cookies)}

    def _get_cookies_for_request(self, url: str) -> list[dict]:
        """Get matching cookies from the internal jar."""
        # For isolated contexts, use the request hostname as default domain
        default_domain = urllib.parse.urlparse(url).hostname or ""
        return [c for c in self._cookies if _cookie_matches(c, url, default_domain)]

    def _handle_response_cookies(self, set_cookie_headers: list[str], url: str) -> None:
        """Store Set-Cookie headers in the internal jar."""
        parsed_url = urllib.parse.urlparse(url)
        now = int(time.time())
        for sc_header in set_cookie_headers:
            cookie = _parse_set_cookie(sc_header)
            if not cookie.get("name"):
                continue
            cookie.setdefault("domain", parsed_url.hostname or "")
            cookie.setdefault("path", "/")
            # Cookies are unique by (name, domain, path)
            key = (cookie["name"], cookie.get("domain", ""), cookie.get("path", "/"))
            # Remove existing cookie with same key
            self._cookies = [
                c for c in self._cookies if (c.get("name"), c.get("domain", ""), c.get("path", "/")) != key
            ]
            # Only store if not expired (Max-Age=0 or negative means delete)
            expiry = cookie.get("expiry")
            if expiry is not None and expiry <= now:
                continue
            self._cookies.append(cookie)
