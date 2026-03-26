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

"""Unit tests for APIRequestContext — no browser required.

Tests cover:
  - _cookie_matches: RFC 6265 domain/path/secure matching
  - _parse_set_cookie: Set-Cookie header parsing
  - APIResponse: response wrapper methods
  - APIRequestFailure: exception behavior
  - _BaseRequestContext: URL resolution, header merging, body prep, query params
  - _IsolatedAPIRequestContext: cookie jar CRUD, storage state, dedup
  - APIRequestContext: lazy init, driver integration (mocked)
  - End-to-end with a local HTTP server
"""

import json
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from unittest import mock

import pytest

from selenium.webdriver.common.api_request_context import (
    APIRequestContext,
    APIRequestFailure,
    APIResponse,
    _BaseRequestContext,
    _cookie_matches,
    _get_set_cookie_headers,
    _IsolatedAPIRequestContext,
    _parse_set_cookie,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


class _TestHandler(BaseHTTPRequestHandler):
    """Minimal HTTP handler for unit tests."""

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/ok":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"ok")
        elif path == "/json":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"key": "value"}')
        elif path == "/echo_headers":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            lines = [f"{k}: {v}" for k, v in self.headers.items()]
            self.wfile.write("\n".join(lines).encode())
        elif path == "/set_cookie":
            import urllib.parse

            qs = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(qs)
            name = params.get("name", ["c"])[0]
            value = params.get("value", ["v"])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Set-Cookie", f"{name}={value}; Path=/")
            self.end_headers()
            self.wfile.write(b"cookie set")
        elif path == "/set_multi_cookies":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Set-Cookie", "a=1; Path=/")
            self.send_header("Set-Cookie", "b=2; Path=/")
            self.end_headers()
            self.wfile.write(b"cookies set")
        elif path == "/redirect":
            self.send_response(302)
            self.send_header("Location", "/ok")
            self.end_headers()
        elif path == "/redirect_with_cookies":
            self.send_response(302)
            self.send_header("Location", "/set_cookie?name=redirected&value=yes")
            self.end_headers()
        elif path == "/redirect_chain":
            import urllib.parse

            qs = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(qs)
            n = int(params.get("n", ["0"])[0])
            if n > 0:
                self.send_response(302)
                self.send_header("Location", f"/redirect_chain?n={n - 1}")
                self.end_headers()
            else:
                self.send_response(200)
                self.send_header("Content-Type", "text/plain")
                self.end_headers()
                self.wfile.write(b"end")
        elif path == "/echo_params":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(self.path.encode())
        else:
            self.send_error(404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length).decode()
        path = self.path.split("?")[0]
        if path == "/echo_body":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(body.encode())
        elif path == "/echo_content_type":
            ct = self.headers.get("Content-Type", "")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"{ct}\n{body}".encode())
        else:
            self.send_error(404)

    def do_HEAD(self):
        if self.path.split("?")[0] == "/ok":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
        else:
            self.send_error(404)

    def do_PUT(self):
        self.do_POST()

    def do_PATCH(self):
        self.do_POST()

    def do_DELETE(self):
        self.send_response(204)
        self.end_headers()

    def log_message(self, format, *args):
        pass  # silence


@pytest.fixture(scope="module")
def server():
    """Start a local HTTP server for the test module."""
    srv = HTTPServer(("127.0.0.1", 0), _TestHandler)
    port = srv.server_address[1]
    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()
    yield f"http://127.0.0.1:{port}"
    srv.shutdown()


@pytest.fixture
def base_url(server):
    return server


def _make_mock_driver(cookies=None):
    driver = mock.MagicMock()
    driver.get_cookies.return_value = cookies or []
    return driver


# ===========================================================================
# 1. _cookie_matches — RFC 6265 domain/path/secure
# ===========================================================================


# --- Domain ---


def test_exact_domain_match():
    assert _cookie_matches({"name": "a", "value": "1", "domain": "example.com"}, "http://example.com/")


def test_exact_domain_no_match():
    assert not _cookie_matches({"name": "a", "value": "1", "domain": "other.com"}, "http://example.com/")


def test_dot_domain_matches_bare():
    assert _cookie_matches({"name": "a", "value": "1", "domain": ".example.com"}, "http://example.com/")


def test_dot_domain_matches_subdomain():
    assert _cookie_matches({"name": "a", "value": "1", "domain": ".example.com"}, "http://sub.example.com/")


def test_dot_domain_no_match_different_domain():
    assert not _cookie_matches({"name": "a", "value": "1", "domain": ".example.com"}, "http://notexample.com/")


def test_dot_domain_no_match_partial_suffix():
    """'.example.com' must NOT match 'fakeexample.com'."""
    assert not _cookie_matches({"name": "a", "value": "1", "domain": ".example.com"}, "http://fakeexample.com/")


def test_empty_domain_no_default_skipped():
    """Host-only cookie with no default_domain should NOT match."""
    assert not _cookie_matches({"name": "a", "value": "1", "domain": ""}, "http://anything.example.com/")


def test_missing_domain_no_default_skipped():
    """Host-only cookie with no default_domain should NOT match."""
    assert not _cookie_matches({"name": "a", "value": "1"}, "http://anything.example.com/")


def test_empty_domain_matches_with_default():
    """Host-only cookie matches when default_domain equals the request hostname."""
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": ""},
        "http://example.com/",
        default_domain="example.com",
    )


def test_empty_domain_no_match_wrong_default():
    """Host-only cookie does NOT match when default_domain differs from request hostname."""
    assert not _cookie_matches(
        {"name": "a", "value": "1", "domain": ""},
        "http://other.com/",
        default_domain="example.com",
    )


def test_missing_domain_matches_with_default():
    assert _cookie_matches(
        {"name": "a", "value": "1"},
        "http://example.com/",
        default_domain="example.com",
    )


# --- Path ---


def test_root_path_matches_all():
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/"}, "http://example.com/any/path"
    )


def test_exact_path_match():
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/api"}, "http://example.com/api"
    )


def test_path_prefix_match():
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/api"}, "http://example.com/api/v1"
    )


def test_path_no_match_different():
    assert not _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/api"}, "http://example.com/other"
    )


def test_path_boundary_no_match():
    """/api must NOT match /apikeys (no / boundary)."""
    assert not _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/api"}, "http://example.com/apikeys"
    )


def test_missing_path_defaults_root():
    assert _cookie_matches({"name": "a", "value": "1", "domain": "example.com"}, "http://example.com/anything")


# --- Secure ---


def test_secure_cookie_matches_https():
    assert _cookie_matches({"name": "a", "value": "1", "domain": "example.com", "secure": True}, "https://example.com/")


def test_secure_cookie_no_match_http():
    assert not _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "secure": True}, "http://example.com/"
    )


def test_non_secure_cookie_matches_http():
    assert _cookie_matches({"name": "a", "value": "1", "domain": "example.com", "secure": False}, "http://example.com/")


def test_non_secure_cookie_matches_https():
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "secure": False}, "https://example.com/"
    )


# --- Combined ---


def test_combined_domain_path_secure():
    cookie = {"name": "a", "value": "1", "domain": ".example.com", "path": "/api", "secure": True}
    assert _cookie_matches(cookie, "https://sub.example.com/api/v1")
    assert not _cookie_matches(cookie, "http://sub.example.com/api/v1")  # http, not https
    assert not _cookie_matches(cookie, "https://sub.example.com/other")  # wrong path
    assert not _cookie_matches(cookie, "https://other.com/api/v1")  # wrong domain


# --- Expiry ---


def test_expired_cookie_no_match():
    past = int(time.time()) - 3600
    assert not _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "expiry": past},
        "http://example.com/",
    )


def test_future_expiry_matches():
    future = int(time.time()) + 3600
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "expiry": future},
        "http://example.com/",
    )


def test_no_expiry_matches():
    """Cookie with no expiry (session cookie) should match."""
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com"},
        "http://example.com/",
    )


# --- Edge cases ---


def test_url_with_port():
    assert _cookie_matches({"name": "a", "value": "1", "domain": "localhost"}, "http://localhost:8080/")


def test_url_with_query_string():
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/api"}, "http://example.com/api?foo=bar"
    )


def test_url_with_fragment():
    assert _cookie_matches(
        {"name": "a", "value": "1", "domain": "example.com", "path": "/api"}, "http://example.com/api#section"
    )


def test_deep_subdomain():
    assert _cookie_matches({"name": "a", "value": "1", "domain": ".example.com"}, "http://a.b.c.example.com/")


def test_ip_address_domain_exact():
    assert _cookie_matches({"name": "a", "value": "1", "domain": "127.0.0.1"}, "http://127.0.0.1/")


def test_ip_address_domain_no_match():
    assert not _cookie_matches({"name": "a", "value": "1", "domain": "127.0.0.1"}, "http://127.0.0.2/")


def test_url_no_path():
    """URL like http://example.com (no trailing slash) has path '' which defaults to '/'."""
    assert _cookie_matches({"name": "a", "value": "1", "domain": "example.com", "path": "/"}, "http://example.com")


# ===========================================================================
# 2. _parse_set_cookie
# ===========================================================================


def test_simple_name_value():
    c = _parse_set_cookie("session=abc123")
    assert c["name"] == "session"
    assert c["value"] == "abc123"


def test_with_domain_and_path():
    c = _parse_set_cookie("id=42; Domain=example.com; Path=/api")
    assert c["name"] == "id"
    assert c["value"] == "42"
    assert c["domain"] == "example.com"
    assert c["path"] == "/api"


def test_secure_and_httponly():
    c = _parse_set_cookie("token=xyz; Secure; HttpOnly")
    assert c["secure"] is True
    assert c["httpOnly"] is True


def test_samesite():
    c = _parse_set_cookie("sid=1; SameSite=Lax")
    assert c["sameSite"] == "Lax"


def test_max_age():
    before = int(time.time())
    c = _parse_set_cookie("sid=1; Max-Age=3600")
    assert c["expiry"] >= before + 3600
    assert c["expiry"] <= before + 3601


def test_expires():
    c = _parse_set_cookie("sid=1; Expires=Wed, 09 Jun 2021 10:18:14 GMT")
    assert "expiry" in c
    assert isinstance(c["expiry"], int)


def test_invalid_max_age_ignored():
    c = _parse_set_cookie("sid=1; Max-Age=notanumber")
    assert "expiry" not in c


def test_no_equals_returns_empty():
    c = _parse_set_cookie("malformed")
    assert c == {}


def test_value_with_equals_sign():
    c = _parse_set_cookie("token=abc=def=ghi; Path=/")
    assert c["name"] == "token"
    assert c["value"] == "abc=def=ghi"
    assert c["path"] == "/"


def test_empty_value():
    c = _parse_set_cookie("deleted=; Path=/; Max-Age=0")
    assert c["name"] == "deleted"
    assert c["value"] == ""


def test_whitespace_handling():
    c = _parse_set_cookie("  name = value ;  Domain = example.com ;  Path = / ")
    assert c["name"] == "name"
    assert c["value"] == "value"
    assert c["domain"] == "example.com"
    assert c["path"] == "/"


def test_case_insensitive_attributes():
    c = _parse_set_cookie("a=1; DOMAIN=example.com; PATH=/; SECURE; HTTPONLY; SAMESITE=Strict")
    assert c["domain"] == "example.com"
    assert c["path"] == "/"
    assert c["secure"] is True
    assert c["httpOnly"] is True
    assert c["sameSite"] == "Strict"


def test_empty_sections_ignored():
    c = _parse_set_cookie("a=1;;; Path=/;;;")
    assert c["name"] == "a"
    assert c["path"] == "/"


def test_invalid_expires_ignored():
    c = _parse_set_cookie("a=1; Expires=not-a-date")
    assert c["name"] == "a"
    assert "expiry" not in c


def test_max_age_zero_sets_past_expiry():
    c = _parse_set_cookie("a=1; Max-Age=0")
    assert c["expiry"] <= int(time.time())


def test_negative_max_age():
    c = _parse_set_cookie("a=1; Max-Age=-1")
    assert c["expiry"] < int(time.time())


def test_max_age_takes_precedence_over_expires():
    """When both Max-Age and Expires are present, Max-Age wins per RFC 6265 §5.3."""
    before = int(time.time())
    c = _parse_set_cookie("a=1; Expires=Wed, 09 Jun 2021 10:18:14 GMT; Max-Age=7200")
    # Max-Age=7200 should take precedence regardless of order
    assert c["expiry"] >= before + 7200


def test_max_age_takes_precedence_even_when_first():
    """Max-Age must win even when it appears before Expires in the header."""
    before = int(time.time())
    c = _parse_set_cookie("a=1; Max-Age=7200; Expires=Wed, 09 Jun 2021 10:18:14 GMT")
    assert c["expiry"] >= before + 7200


# ===========================================================================
# 2b. _get_set_cookie_headers
# ===========================================================================


def test_with_getlist():
    resp = mock.MagicMock()
    resp.headers.getlist.return_value = ["a=1", "b=2"]
    assert _get_set_cookie_headers(resp) == ["a=1", "b=2"]


def test_fallback_to_get():
    resp = mock.MagicMock(spec=[])
    resp.headers = mock.MagicMock(spec=["get"])
    resp.headers.get.return_value = "a=1"
    assert _get_set_cookie_headers(resp) == ["a=1"]


def test_none_when_no_set_cookie():
    resp = mock.MagicMock(spec=[])
    resp.headers = mock.MagicMock(spec=["get"])
    resp.headers.get.return_value = None
    assert _get_set_cookie_headers(resp) == []


# ===========================================================================
# 3. APIResponse
# ===========================================================================


def test_ok_true_for_2xx():
    for code in [200, 201, 204, 299]:
        r = APIResponse(code, "OK", {}, "http://x", b"")
        assert r.ok, f"Expected ok for status {code}"


def test_ok_false_outside_2xx():
    for code in [100, 199, 300, 400, 404, 500]:
        r = APIResponse(code, "Err", {}, "http://x", b"")
        assert not r.ok, f"Expected not ok for status {code}"


def test_json_parsing():
    r = APIResponse(200, "OK", {}, "http://x", b'{"a": 1}')
    assert r.json() == {"a": 1}


def test_json_invalid_raises():
    r = APIResponse(200, "OK", {}, "http://x", b"not json")
    with pytest.raises(json.JSONDecodeError):
        r.json()


def test_text_decoding():
    r = APIResponse(200, "OK", {}, "http://x", "héllo".encode())
    assert r.text() == "héllo"


def test_text_invalid_utf8_raises():
    r = APIResponse(200, "OK", {}, "http://x", b"\xff\xfe")
    with pytest.raises(UnicodeDecodeError):
        r.text()


def test_body_returns_bytes():
    r = APIResponse(200, "OK", {}, "http://x", b"\x00\x01\x02")
    assert r.body() == b"\x00\x01\x02"


def test_dispose_clears_body():
    r = APIResponse(200, "OK", {}, "http://x", b"data")
    assert r.body() == b"data"
    r.dispose()
    assert r.body() == b""
    assert r.text() == ""


def test_attributes_accessible():
    r = APIResponse(201, "Created", {"x-foo": "bar"}, "http://example.com/api", b"")
    assert r.status == 201
    assert r.status_text == "Created"
    assert r.headers == {"x-foo": "bar"}
    assert r.url == "http://example.com/api"


# ===========================================================================
# 4. APIRequestFailure
# ===========================================================================


def test_message_format():
    r = APIResponse(404, "Not Found", {}, "http://example.com/missing", b"")
    exc = APIRequestFailure(r)
    assert str(exc) == "404 Not Found: http://example.com/missing"


def test_response_accessible():
    r = APIResponse(500, "Internal Server Error", {}, "http://x", b"err")
    exc = APIRequestFailure(r)
    assert exc.response is r
    assert exc.response.status == 500


def test_is_exception():
    r = APIResponse(400, "Bad Request", {}, "http://x", b"")
    with pytest.raises(APIRequestFailure):
        raise APIRequestFailure(r)


def test_empty_status_text():
    r = APIResponse(418, "", {}, "http://x", b"")
    exc = APIRequestFailure(r)
    assert str(exc) == "418 : http://x"


# ===========================================================================
# 5. _BaseRequestContext — URL resolution, headers, body, params
# ===========================================================================


def test_resolve_url_absolute():
    ctx = _BaseRequestContext(base_url="http://example.com")
    assert ctx._resolve_url("http://other.com/path") == "http://other.com/path"


def test_resolve_url_relative():
    ctx = _BaseRequestContext(base_url="http://example.com")
    assert ctx._resolve_url("api/users") == "http://example.com/api/users"


def test_resolve_url_relative_with_leading_slash():
    ctx = _BaseRequestContext(base_url="http://example.com")
    assert ctx._resolve_url("/api/users") == "http://example.com/api/users"


def test_resolve_url_base_trailing_slash():
    ctx = _BaseRequestContext(base_url="http://example.com/")
    assert ctx._resolve_url("api") == "http://example.com/api"


def test_resolve_url_no_base_url():
    ctx = _BaseRequestContext(base_url="")
    # relative URL with no base — results in /path (will fail at HTTP level but that's correct)
    result = ctx._resolve_url("path")
    assert result == "/path"


def test_build_headers_merges():
    ctx = _BaseRequestContext(extra_headers={"X-Default": "1"})
    h = ctx._build_headers({"headers": {"X-Custom": "2"}})
    assert h == {"X-Default": "1", "X-Custom": "2"}


def test_build_headers_override():
    ctx = _BaseRequestContext(extra_headers={"X-Key": "old"})
    h = ctx._build_headers({"headers": {"X-Key": "new"}})
    assert h == {"X-Key": "new"}


def test_build_headers_no_extras():
    ctx = _BaseRequestContext()
    h = ctx._build_headers({"headers": {"X-A": "1"}})
    assert h == {"X-A": "1"}


def test_build_headers_no_kwargs():
    ctx = _BaseRequestContext(extra_headers={"X-A": "1"})
    h = ctx._build_headers({})
    assert h == {"X-A": "1"}


def test_prepare_body_json():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"json_data": {"key": "value"}})
    assert body == b'{"key": "value"}'
    assert headers["Content-Type"] == "application/json"


def test_prepare_body_form_kwarg():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"form": {"field": "val"}})
    assert body == b"field=val"
    assert headers["Content-Type"] == "application/x-www-form-urlencoded"


def test_prepare_body_data_dict():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"data": {"field": "val"}})
    assert body == b"field=val"
    assert headers["Content-Type"] == "application/x-www-form-urlencoded"


def test_prepare_body_data_string():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"data": "raw text"})
    assert body == b"raw text"
    assert "Content-Type" not in headers


def test_prepare_body_data_bytes():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"data": b"\x00\x01"})
    assert body == b"\x00\x01"


def test_prepare_body_none():
    ctx = _BaseRequestContext()
    body = ctx._prepare_body({}, {})
    assert body is None


def test_prepare_body_json_takes_priority_over_form():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"json_data": {"a": 1}, "form": {"b": 2}})
    assert body == b'{"a": 1}'
    assert headers["Content-Type"] == "application/json"


def test_prepare_body_form_takes_priority_over_data():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"form": {"a": 1}, "data": "raw"})
    assert body == b"a=1"


def test_prepare_body_does_not_override_explicit_content_type():
    ctx = _BaseRequestContext()
    headers = {"Content-Type": "text/xml"}
    ctx._prepare_body(headers, {"json_data": {"a": 1}})
    assert headers["Content-Type"] == "text/xml"


def test_append_params_new():
    ctx = _BaseRequestContext()
    url = ctx._append_params("http://example.com/api", {"params": {"q": "test", "page": "1"}})
    assert "?" in url
    assert "q=test" in url
    assert "page=1" in url


def test_append_params_existing_query():
    ctx = _BaseRequestContext()
    url = ctx._append_params("http://example.com/api?existing=1", {"params": {"extra": "2"}})
    assert "&extra=2" in url
    assert "?" in url
    assert url.count("?") == 1


def test_append_params_none():
    ctx = _BaseRequestContext()
    url = ctx._append_params("http://example.com/api", {})
    assert url == "http://example.com/api"


def test_prepare_body_form_special_characters():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"form": {"q": "hello world", "tag": "a&b=c"}})
    decoded = body.decode("utf-8")
    assert "q=hello+world" in decoded or "q=hello%20world" in decoded
    assert "tag=a%26b%3Dc" in decoded


def test_prepare_body_data_dict_special_characters():
    ctx = _BaseRequestContext()
    headers = {}
    body = ctx._prepare_body(headers, {"data": {"key": "val with spaces"}})
    decoded = body.decode("utf-8")
    assert "key=val+with+spaces" in decoded or "key=val%20with%20spaces" in decoded


def test_dispose_clears_pool():
    ctx = _BaseRequestContext()
    ctx.dispose()
    # Should not raise; pool is cleared


def test_execute_request_no_silent_retries():
    """Retry config should disable connection/read retries to prevent silent retry storms."""
    ctx = _BaseRequestContext()
    with mock.patch.object(ctx._pool, "request") as mock_request:
        mock_request.return_value = mock.MagicMock(status=200, headers={}, data=b"")
        ctx._execute_request("GET", "http://example.com/", {}, None, {})
        retries = mock_request.call_args[1]["retries"]
        assert retries.connect == 0, "connect retries must be disabled"
        assert retries.read == 0, "read retries must be disabled"
        assert retries.status == 0, "status retries must be disabled"
        assert retries.other == 0, "other retries must be disabled"


def test_build_response_reason_missing():
    """_build_response should not raise if resp has no 'reason' attribute (urllib3 2.x+)."""
    ctx = _BaseRequestContext()
    resp = mock.MagicMock(spec=["status", "headers", "data"])
    resp.status = 200
    resp.headers = {}
    resp.data = b""
    result = ctx._build_response(resp, "http://example.com/")
    assert result.status == 200
    assert result.status_text == "OK"


def test_build_response_reason_present():
    """_build_response should use resp.reason when present."""
    ctx = _BaseRequestContext()
    resp = mock.MagicMock()
    resp.status = 200
    resp.reason = "Custom Reason"
    resp.headers = {}
    result = ctx._build_response(resp, "http://example.com/")
    assert result.status_text == "Custom Reason"


# ===========================================================================
# 6. _IsolatedAPIRequestContext — cookie jar CRUD & storage state
# ===========================================================================


def test_empty_cookie_jar():
    ctx = _IsolatedAPIRequestContext()
    assert ctx._get_cookies_for_request("http://example.com") == []


def test_preloaded_cookies():
    cookies = [{"name": "a", "value": "1", "domain": "example.com", "path": "/"}]
    ctx = _IsolatedAPIRequestContext(cookies=cookies)
    matched = ctx._get_cookies_for_request("http://example.com/path")
    assert len(matched) == 1
    assert matched[0]["name"] == "a"


def test_cookie_domain_filtering():
    cookies = [
        {"name": "a", "value": "1", "domain": "example.com", "path": "/"},
        {"name": "b", "value": "2", "domain": "other.com", "path": "/"},
    ]
    ctx = _IsolatedAPIRequestContext(cookies=cookies)
    matched = ctx._get_cookies_for_request("http://example.com/")
    assert len(matched) == 1
    assert matched[0]["name"] == "a"


def test_handle_response_cookies_adds_to_jar():
    ctx = _IsolatedAPIRequestContext()
    ctx._handle_response_cookies(["new_cookie=val; Path=/"], "http://example.com/")
    assert len(ctx._cookies) == 1
    assert ctx._cookies[0]["name"] == "new_cookie"
    assert ctx._cookies[0]["value"] == "val"
    assert ctx._cookies[0]["domain"] == "example.com"


def test_cookie_dedup_by_name_domain_path():
    ctx = _IsolatedAPIRequestContext()
    ctx._handle_response_cookies(["c=first; Path=/"], "http://example.com/")
    ctx._handle_response_cookies(["c=second; Path=/"], "http://example.com/")
    assert len(ctx._cookies) == 1
    assert ctx._cookies[0]["value"] == "second"


def test_same_name_different_path_not_deduped():
    ctx = _IsolatedAPIRequestContext()
    ctx._handle_response_cookies(["c=1; Path=/a"], "http://example.com/")
    ctx._handle_response_cookies(["c=2; Path=/b"], "http://example.com/")
    assert len(ctx._cookies) == 2


def test_same_name_different_domain_not_deduped():
    ctx = _IsolatedAPIRequestContext()
    ctx._handle_response_cookies(["c=1; Domain=a.com; Path=/"], "http://a.com/")
    ctx._handle_response_cookies(["c=2; Domain=b.com; Path=/"], "http://b.com/")
    assert len(ctx._cookies) == 2


def test_storage_state_returns_copy():
    cookies = [{"name": "a", "value": "1", "domain": "x", "path": "/"}]
    ctx = _IsolatedAPIRequestContext(cookies=cookies)
    state = ctx.get_storage_state()
    assert state == {"cookies": cookies}
    # Mutating returned state shouldn't affect internal jar
    state["cookies"].append({"name": "b"})
    assert len(ctx._cookies) == 1


def test_storage_state_empty():
    ctx = _IsolatedAPIRequestContext()
    assert ctx.get_storage_state() == {"cookies": []}


def test_malformed_set_cookie_skipped():
    """Set-Cookie header with no '=' (no name) should be silently skipped."""
    ctx = _IsolatedAPIRequestContext()
    ctx._handle_response_cookies(["malformed-no-equals", "good=val; Path=/"], "http://example.com/")
    assert len(ctx._cookies) == 1
    assert ctx._cookies[0]["name"] == "good"


def test_expired_cookie_not_stored():
    """Set-Cookie with Max-Age=0 should remove existing cookie and not store new one."""
    ctx = _IsolatedAPIRequestContext()
    ctx._handle_response_cookies(["sess=val; Path=/"], "http://example.com/")
    assert len(ctx._cookies) == 1
    # Server sends Max-Age=0 to delete the cookie
    ctx._handle_response_cookies(["sess=; Max-Age=0; Path=/"], "http://example.com/")
    assert len(ctx._cookies) == 0


def test_expired_cookie_not_sent():
    """Cookies with past expiry should not be sent with requests."""
    past = int(time.time()) - 3600
    cookies = [{"name": "old", "value": "stale", "domain": "example.com", "path": "/", "expiry": past}]
    ctx = _IsolatedAPIRequestContext(cookies=cookies)
    matched = ctx._get_cookies_for_request("http://example.com/")
    assert len(matched) == 0


def test_isolated_context_dispose():
    ctx = _IsolatedAPIRequestContext()
    ctx.dispose()  # should not raise


# ===========================================================================
# 7. APIRequestContext — driver integration (mocked)
# ===========================================================================


def test_get_cookies_for_request():
    driver = _make_mock_driver(
        [
            {"name": "a", "value": "1", "domain": "example.com", "path": "/"},
            {"name": "b", "value": "2", "domain": "other.com", "path": "/"},
        ]
    )
    ctx = APIRequestContext(driver)
    matched = ctx._get_cookies_for_request("http://example.com/")
    assert len(matched) == 1
    assert matched[0]["name"] == "a"


def test_get_cookies_driver_exception():
    driver = _make_mock_driver()
    driver.get_cookies.side_effect = Exception("session expired")
    ctx = APIRequestContext(driver)
    assert ctx._get_cookies_for_request("http://example.com/") == []


def test_handle_response_cookies_calls_add_cookie():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    ctx._handle_response_cookies(["session=abc; Path=/"], "http://example.com/api")
    driver.add_cookie.assert_called_once()
    call_arg = driver.add_cookie.call_args[0][0]
    assert call_arg["name"] == "session"
    assert call_arg["value"] == "abc"
    assert call_arg["domain"] == "example.com"


def test_handle_response_cookies_add_cookie_failure():
    driver = _make_mock_driver()
    driver.add_cookie.side_effect = Exception("domain mismatch")
    ctx = APIRequestContext(driver)
    # Should not raise — logs warning instead
    ctx._handle_response_cookies(["session=abc; Path=/"], "http://example.com/")


def test_mocked_storage_state():
    driver = _make_mock_driver([{"name": "x", "value": "y"}])
    ctx = APIRequestContext(driver)
    state = ctx.get_storage_state()
    assert state == {"cookies": [{"name": "x", "value": "y"}]}


def test_mocked_storage_state_to_file():
    driver = _make_mock_driver([{"name": "x", "value": "y"}])
    ctx = APIRequestContext(driver)
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        tmp = f.name
    try:
        ctx.get_storage_state(path=tmp)
        data = json.loads(Path(tmp).read_text())
        assert data["cookies"][0]["name"] == "x"
    finally:
        Path(tmp).unlink(missing_ok=True)


def test_storage_state_with_pathlib():
    driver = _make_mock_driver([{"name": "x", "value": "y"}])
    ctx = APIRequestContext(driver)
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        tmp = Path(f.name)
    try:
        ctx.get_storage_state(path=tmp)
        data = json.loads(tmp.read_text())
        assert data["cookies"][0]["name"] == "x"
    finally:
        tmp.unlink(missing_ok=True)


def test_new_context_returns_isolated():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    isolated = ctx.new_context()
    assert isinstance(isolated, _IsolatedAPIRequestContext)
    isolated.dispose()


def test_new_context_with_storage_state_dict():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    isolated = ctx.new_context(storage_state={"cookies": [{"name": "a", "value": "1"}]})
    state = isolated.get_storage_state()
    assert len(state["cookies"]) == 1
    assert state["cookies"][0]["name"] == "a"
    isolated.dispose()


def test_new_context_with_storage_state_file():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        json.dump({"cookies": [{"name": "b", "value": "2"}]}, f)
        tmp = f.name
    try:
        isolated = ctx.new_context(storage_state=tmp)
        state = isolated.get_storage_state()
        assert state["cookies"][0]["name"] == "b"
        isolated.dispose()
    finally:
        Path(tmp).unlink(missing_ok=True)


def test_new_context_with_storage_state_pathlib():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        json.dump({"cookies": [{"name": "c", "value": "3"}]}, f)
        tmp = Path(f.name)
    try:
        isolated = ctx.new_context(storage_state=tmp)
        state = isolated.get_storage_state()
        assert state["cookies"][0]["name"] == "c"
        isolated.dispose()
    finally:
        tmp.unlink(missing_ok=True)


def test_new_context_empty_storage_state():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    isolated = ctx.new_context(storage_state={"cookies": []})
    assert isolated.get_storage_state() == {"cookies": []}
    isolated.dispose()


def test_new_context_inherits_timeout_and_redirects():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver, timeout=5.0, max_redirects=3)
    isolated = ctx.new_context()
    assert isolated._timeout == 5.0
    assert isolated._max_redirects == 3
    isolated.dispose()


def test_new_context_fail_on_status_code():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    isolated = ctx.new_context(fail_on_status_code=True)
    assert isolated._fail_on_status_code is True
    isolated.dispose()


def test_new_context_with_base_url_and_extra_headers():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    isolated = ctx.new_context(
        base_url="http://api.example.com",
        extra_headers={"Authorization": "Bearer token123"},
    )
    assert isolated._base_url == "http://api.example.com"
    assert isolated._extra_headers == {"Authorization": "Bearer token123"}
    isolated.dispose()


def test_handle_response_cookies_skips_malformed():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    ctx._handle_response_cookies(["malformed-header", "good=val; Path=/"], "http://example.com/")
    # Only the valid cookie should trigger add_cookie
    driver.add_cookie.assert_called_once()
    assert driver.add_cookie.call_args[0][0]["name"] == "good"


def test_multiple_browser_cookies_sent():
    """Multiple matching cookies should all appear in the Cookie header."""
    driver = _make_mock_driver(
        [
            {"name": "a", "value": "1", "domain": "example.com", "path": "/"},
            {"name": "b", "value": "2", "domain": "example.com", "path": "/"},
            {"name": "c", "value": "3", "domain": "other.com", "path": "/"},
        ]
    )
    ctx = APIRequestContext(driver)
    matched = ctx._get_cookies_for_request("http://example.com/api")
    assert len(matched) == 2
    names = {c["name"] for c in matched}
    assert names == {"a", "b"}


def test_new_context_file_not_found():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    with pytest.raises(FileNotFoundError, match="not_exist"):
        ctx.new_context(storage_state="/tmp/not_exist_abc123.json")


def test_new_context_invalid_json():
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        f.write("not valid json {{{")
        tmp = f.name
    try:
        with pytest.raises(ValueError, match="Invalid JSON"):
            ctx.new_context(storage_state=tmp)
    finally:
        Path(tmp).unlink(missing_ok=True)


def test_storage_state_unwritable_path():
    driver = _make_mock_driver([{"name": "x", "value": "y"}])
    ctx = APIRequestContext(driver)
    with pytest.raises(OSError, match="Cannot write"):
        ctx.get_storage_state(path="/nonexistent_dir_abc123/state.json")


def test_host_only_cookie_skipped_when_current_url_unavailable():
    """Host-only cookies (empty domain) should NOT be sent when current_url raises."""
    driver = _make_mock_driver(
        [
            {"name": "hostonly", "value": "1", "domain": "", "path": "/"},
            {"name": "explicit", "value": "2", "domain": "example.com", "path": "/"},
        ]
    )
    driver.current_url = mock.PropertyMock(side_effect=Exception("no session"))
    ctx = APIRequestContext(driver)
    matched = ctx._get_cookies_for_request("http://example.com/")
    names = {c["name"] for c in matched}
    assert "hostonly" not in names
    assert "explicit" in names


def test_host_only_cookie_skipped_when_current_url_empty():
    """Host-only cookies should NOT be sent when current_url returns empty string."""
    driver = _make_mock_driver(
        [
            {"name": "hostonly", "value": "1", "domain": "", "path": "/"},
            {"name": "explicit", "value": "2", "domain": "example.com", "path": "/"},
        ]
    )
    driver.current_url = ""
    ctx = APIRequestContext(driver)
    matched = ctx._get_cookies_for_request("http://example.com/")
    names = {c["name"] for c in matched}
    assert "hostonly" not in names
    assert "explicit" in names


def test_host_only_cookie_skipped_when_current_url_about_blank():
    """Host-only cookies should NOT be sent when current_url is about:blank."""
    driver = _make_mock_driver(
        [
            {"name": "hostonly", "value": "1", "domain": "", "path": "/"},
            {"name": "explicit", "value": "2", "domain": "example.com", "path": "/"},
        ]
    )
    driver.current_url = "about:blank"
    ctx = APIRequestContext(driver)
    matched = ctx._get_cookies_for_request("http://example.com/")
    names = {c["name"] for c in matched}
    assert "hostonly" not in names
    assert "explicit" in names


def test_handle_response_cookies_skips_expired_in_browser_context():
    """Set-Cookie with Max-Age=0 should delete, not add, in browser context."""
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    # Max-Age=0 means expired immediately
    ctx._handle_response_cookies(["sess=; Max-Age=0; Path=/"], "http://example.com/")
    driver.add_cookie.assert_not_called()
    driver.delete_cookie.assert_called_once_with("sess")


def test_new_context_file_read_error():
    """File exists but raises OSError on read → should raise OSError with clear message."""
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        f.write("{}")
        tmp = f.name
    try:
        with mock.patch("builtins.open", side_effect=OSError("Permission denied")):
            with pytest.raises(OSError, match="Cannot read storage state file"):
                ctx.new_context(storage_state=tmp)
    finally:
        Path(tmp).unlink(missing_ok=True)


def test_handle_response_cookies_multiple_headers():
    """Multiple Set-Cookie headers should each trigger add_cookie."""
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    ctx._handle_response_cookies(["a=1; Path=/", "b=2; Path=/"], "http://example.com/")
    assert driver.add_cookie.call_count == 2
    names = {call[0][0]["name"] for call in driver.add_cookie.call_args_list}
    assert names == {"a", "b"}


def test_handle_response_cookies_expired_delete_failure_swallowed():
    """delete_cookie failure on expired cookie should be silently swallowed."""
    driver = _make_mock_driver()
    driver.delete_cookie.side_effect = Exception("no such cookie")
    ctx = APIRequestContext(driver)
    ctx._handle_response_cookies(["sess=; Max-Age=0; Path=/"], "http://example.com/")
    driver.delete_cookie.assert_called_once_with("sess")
    driver.add_cookie.assert_not_called()


def test_host_only_cookie_included_when_current_url_matches():
    """Host-only cookie (empty domain) should be included when current_url hostname matches."""
    driver = _make_mock_driver(
        [
            {"name": "hostonly", "value": "1", "domain": "", "path": "/"},
            {"name": "explicit", "value": "2", "domain": "example.com", "path": "/"},
        ]
    )
    driver.current_url = "http://example.com/page"
    ctx = APIRequestContext(driver)
    matched = ctx._get_cookies_for_request("http://example.com/api")
    names = {c["name"] for c in matched}
    assert "hostonly" in names
    assert "explicit" in names


def test_new_context_storage_state_dict_no_cookies_key():
    """storage_state dict without 'cookies' key should produce an isolated context with 0 cookies."""
    driver = _make_mock_driver()
    ctx = APIRequestContext(driver)
    isolated = ctx.new_context(storage_state={"other": "data"})
    state = isolated.get_storage_state()
    assert state["cookies"] == []
    isolated.dispose()


# ===========================================================================
# 8. End-to-end with local HTTP server — _IsolatedAPIRequestContext
# ===========================================================================


def test_e2e_get_200(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/ok")
    assert r.status == 200
    assert r.ok
    assert r.text() == "ok"
    ctx.dispose()


def test_e2e_get_404(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/nonexistent")
    assert r.status == 404
    assert not r.ok
    ctx.dispose()


def test_e2e_head(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.head("/ok")
    assert r.status == 200
    assert r.body() == b""
    ctx.dispose()


def test_e2e_post_json(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_body", json_data={"key": "value"})
    assert r.status == 200
    parsed = json.loads(r.text())
    assert parsed["key"] == "value"
    ctx.dispose()


def test_e2e_post_form(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_body", form={"field": "val"})
    assert r.status == 200
    assert "field=val" in r.text()
    ctx.dispose()


def test_e2e_post_data_dict(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_body", data={"field": "val"})
    assert "field=val" in r.text()
    ctx.dispose()


def test_e2e_post_data_string(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_body", data="raw content")
    assert r.text() == "raw content"
    ctx.dispose()


def test_e2e_post_data_bytes(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_body", data=b"bytes content")
    assert r.text() == "bytes content"
    ctx.dispose()


def test_e2e_post_content_type_json(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_content_type", json_data={"a": 1})
    assert "application/json" in r.text()
    ctx.dispose()


def test_e2e_post_content_type_form(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_content_type", form={"a": "1"})
    assert "application/x-www-form-urlencoded" in r.text()
    ctx.dispose()


def test_e2e_put(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.put("/echo_body", json_data={"updated": True})
    assert r.status == 200
    assert json.loads(r.text())["updated"] is True
    ctx.dispose()


def test_e2e_patch(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.patch("/echo_body", json_data={"patched": True})
    assert r.status == 200
    ctx.dispose()


def test_e2e_delete(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.delete("/ok")
    assert r.status == 204
    ctx.dispose()


def test_e2e_fetch_custom_method(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.fetch("/ok", method="GET")
    assert r.status == 200
    ctx.dispose()


def test_e2e_json_response(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/json")
    data = r.json()
    assert data == {"key": "value"}
    ctx.dispose()


def test_e2e_response_headers_lowercased(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/json")
    assert "content-type" in r.headers
    ctx.dispose()


def test_e2e_duplicate_response_headers_preserved(base_url):
    """Multiple Set-Cookie headers should be combined with ', ' per RFC 7230."""
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/set_multi_cookies")
    sc = r.headers.get("set-cookie", "")
    assert "a=1" in sc
    assert "b=2" in sc
    ctx.dispose()


def test_e2e_response_status_text(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/ok")
    assert r.status_text == "OK"
    r404 = ctx.get("/nonexistent")
    assert r404.status_text == "Not Found"
    ctx.dispose()


def test_e2e_custom_headers_sent(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/echo_headers", headers={"X-Test": "unit123"})
    assert "unit123" in r.text()
    ctx.dispose()


def test_e2e_extra_headers(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url, extra_headers={"X-Global": "global_val"})
    r = ctx.get("/echo_headers")
    assert "global_val" in r.text()
    ctx.dispose()


def test_e2e_query_params(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/echo_params", params={"q": "search", "page": "2"})
    assert "q=search" in r.text()
    assert "page=2" in r.text()
    ctx.dispose()


def test_e2e_base_url_resolution(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("ok")  # relative
    assert r.status == 200
    assert r.text() == "ok"
    ctx.dispose()


def test_e2e_absolute_url_ignores_base(base_url):
    ctx = _IsolatedAPIRequestContext(base_url="http://wrong-host:99999")
    r = ctx.get(f"{base_url}/ok")  # absolute
    assert r.status == 200
    ctx.dispose()


def test_e2e_redirect_followed(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/redirect")
    assert r.status == 200
    assert r.text() == "ok"
    ctx.dispose()


def test_e2e_redirect_chain_within_limit(base_url):
    """A 3-hop redirect chain should succeed with max_redirects=5."""
    ctx = _IsolatedAPIRequestContext(base_url=base_url, max_redirects=5)
    r = ctx.get("/redirect_chain?n=3")
    assert r.status == 200
    assert r.text() == "end"
    ctx.dispose()


def test_e2e_redirect_chain_exceeds_limit(base_url):
    """A 5-hop chain with max_redirects=2 should NOT reach the final 200."""
    ctx = _IsolatedAPIRequestContext(base_url=base_url, max_redirects=2)
    r = ctx.get("/redirect_chain?n=5")
    # Should get a 302 (stopped mid-chain) instead of following all the way to 200
    assert r.status == 302
    ctx.dispose()


def test_e2e_redirect_cookies_associated_with_final_url(base_url):
    """Cookies from a redirected response must be associated with the final URL's origin."""
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/redirect_with_cookies")
    assert r.status == 200
    assert r.text() == "cookie set"
    # The response URL should be the final destination, not the redirect source
    assert "/set_cookie" in r.url
    assert "/redirect_with_cookies" not in r.url
    # The cookie should be stored with the correct domain (from the final URL)
    assert len(ctx._cookies) == 1
    assert ctx._cookies[0]["name"] == "redirected"
    assert ctx._cookies[0]["value"] == "yes"
    ctx.dispose()


def test_e2e_cookie_set_and_sent(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    # Server sets a cookie
    ctx.get("/set_cookie?name=sess&value=abc")
    assert len(ctx._cookies) == 1
    # Cookie should be sent on next request
    r = ctx.get("/echo_headers")
    assert "sess=abc" in r.text()
    ctx.dispose()


def test_e2e_multiple_cookies_set(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    ctx.get("/set_multi_cookies")
    assert len(ctx._cookies) == 2
    names = {c["name"] for c in ctx._cookies}
    assert names == {"a", "b"}
    ctx.dispose()


def test_e2e_preloaded_cookies_sent(base_url):
    cookies = [{"name": "pre", "value": "loaded", "domain": "127.0.0.1", "path": "/"}]
    ctx = _IsolatedAPIRequestContext(base_url=base_url, cookies=cookies)
    r = ctx.get("/echo_headers")
    assert "pre=loaded" in r.text()
    ctx.dispose()


def test_e2e_fail_on_status_code_raises(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url, fail_on_status_code=True)
    with pytest.raises(APIRequestFailure) as exc_info:
        ctx.get("/nonexistent")
    assert exc_info.value.response.status == 404
    ctx.dispose()


def test_e2e_fail_on_status_code_no_raise_on_success(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url, fail_on_status_code=True)
    r = ctx.get("/ok")
    assert r.status == 200
    ctx.dispose()


def test_e2e_fail_on_status_code_per_request(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    with pytest.raises(APIRequestFailure):
        ctx.get("/nonexistent", fail_on_status_code=True)
    ctx.dispose()


def test_e2e_fail_on_status_code_per_request_override_false(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url, fail_on_status_code=True)
    r = ctx.get("/nonexistent", fail_on_status_code=False)
    assert r.status == 404
    ctx.dispose()


def test_e2e_dispose_clears_connections(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/ok")
    assert r.status == 200
    ctx.dispose()
    # PoolManager.clear() closes existing connections but the pool
    # remains usable (new connections are opened on demand).
    # Verify dispose doesn't break subsequent calls — it just frees resources.
    r2 = ctx.get("/ok")
    assert r2.status == 200
    ctx.dispose()


def test_e2e_response_dispose(base_url):
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.get("/ok")
    assert len(r.body()) > 0
    r.dispose()
    assert r.body() == b""
    ctx.dispose()


def test_e2e_multiple_cookies_sent_in_header(base_url):
    """Both cookies from the jar should appear in a single Cookie header."""
    cookies = [
        {"name": "a", "value": "1", "domain": "127.0.0.1", "path": "/"},
        {"name": "b", "value": "2", "domain": "127.0.0.1", "path": "/"},
    ]
    ctx = _IsolatedAPIRequestContext(base_url=base_url, cookies=cookies)
    r = ctx.get("/echo_headers")
    text = r.text()
    assert "a=1" in text
    assert "b=2" in text
    ctx.dispose()


def test_e2e_cookie_update_sends_latest(base_url):
    """After a cookie value is updated via Set-Cookie, the new value is sent."""
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    ctx.get("/set_cookie?name=tok&value=old")
    ctx.get("/set_cookie?name=tok&value=new")
    assert len(ctx._cookies) == 1
    assert ctx._cookies[0]["value"] == "new"
    r = ctx.get("/echo_headers")
    assert "tok=new" in r.text()
    assert "tok=old" not in r.text()
    ctx.dispose()


def test_e2e_explicit_cookie_header_merged(base_url):
    """User-provided Cookie header should be merged with jar cookies."""
    cookies = [{"name": "jar", "value": "fromjar", "domain": "127.0.0.1", "path": "/"}]
    ctx = _IsolatedAPIRequestContext(base_url=base_url, cookies=cookies)
    r = ctx.get("/echo_headers", headers={"Cookie": "explicit=fromuser"})
    text = r.text()
    assert "explicit=fromuser" in text
    assert "jar=fromjar" in text
    ctx.dispose()


def test_e2e_isolated_storage_state_roundtrip(base_url):
    """Save isolated context state to file, load into new context, verify cookies work."""
    ctx1 = _IsolatedAPIRequestContext(base_url=base_url)
    ctx1.get("/set_cookie?name=rt&value=roundtrip")
    state = ctx1.get_storage_state()
    ctx1.dispose()

    # Create new context from saved state
    ctx2 = _IsolatedAPIRequestContext(
        base_url=base_url,
        cookies=state["cookies"],
    )
    r = ctx2.get("/echo_headers")
    assert "rt=roundtrip" in r.text()
    ctx2.dispose()


def test_e2e_form_special_characters(base_url):
    """Form-encoded body with special characters is properly encoded."""
    ctx = _IsolatedAPIRequestContext(base_url=base_url)
    r = ctx.post("/echo_body", form={"msg": "hello world", "sym": "a&b=c"})
    text = r.text()
    # urllib.parse.urlencode uses + for spaces
    assert "msg=hello+world" in text or "msg=hello%20world" in text
    assert "sym=a%26b%3Dc" in text
    ctx.dispose()


# ===========================================================================
# 9. WebDriver.request property (mocked)
# ===========================================================================


def test_lazy_init_and_singleton():
    """Simulate the lazy property pattern from webdriver.py."""
    driver = mock.MagicMock()
    driver._request = None

    # Simulate the property logic
    if driver._request is None:
        driver._request = APIRequestContext(driver)
    first = driver._request
    # Second access
    second = driver._request
    assert first is second
    assert isinstance(first, APIRequestContext)


def test_quit_cleanup():
    """Simulate quit() disposing the request context."""
    driver = mock.MagicMock()
    ctx = APIRequestContext(driver)
    driver._request = ctx

    # Simulate quit
    if driver._request is not None:
        driver._request.dispose()
        driver._request = None

    assert driver._request is None
