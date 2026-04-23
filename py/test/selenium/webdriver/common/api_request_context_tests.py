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

import json
import tempfile
from pathlib import Path

import pytest

from selenium.webdriver.common.api_request_context import APIRequestContext, APIRequestFailure


@pytest.fixture(autouse=True)
def setup(driver, pages):
    driver.get(pages.url("simpleTest.html"))
    driver.delete_all_cookies()


def test_request_initialized(driver):
    assert driver.request is not None


def test_request_returns_same_instance(driver):
    first = driver.request
    second = driver.request
    assert first is second


def test_get_request(driver, pages):
    response = driver.request.get(pages.url("simpleTest.html"))
    assert response.status == 200
    assert response.ok
    assert "html" in response.text().lower()


def test_get_nonexistent_page(driver, pages):
    response = driver.request.get(pages.url("nonexistent_page_xyz.html"))
    assert response.status == 404
    assert not response.ok


def test_response_status_text(driver, pages):
    response = driver.request.get(pages.url("simpleTest.html"))
    assert response.status_text == "OK"
    response_404 = driver.request.get(pages.url("nonexistent_page_xyz.html"))
    # The webserver sends a custom reason phrase with send_error(),
    # so check it's non-empty rather than an exact string.
    assert response_404.status_text
    assert "Not Found" in response_404.status_text


def test_head_request(driver, pages):
    response = driver.request.head(pages.url("simpleTest.html"))
    assert response.status == 200
    assert response.body() == b""


def test_post_json(driver, pages):
    response = driver.request.post(
        pages.url("echo_body"),
        json_data={"key": "value"},
    )
    assert response.status == 200
    body = json.loads(response.text())
    assert body["key"] == "value"


def test_post_form_data(driver, pages):
    response = driver.request.post(
        pages.url("echo_body"),
        data={"field": "value"},
    )
    assert response.status == 200
    assert "field=value" in response.text()


def test_post_form_kwarg(driver, pages):
    response = driver.request.post(
        pages.url("echo_body"),
        form={"username": "testuser", "password": "testpass"},
    )
    assert response.status == 200
    text = response.text()
    assert "username=testuser" in text
    assert "password=testpass" in text


def test_browser_cookies_sent_with_request(driver, pages):
    driver.add_cookie({"name": "test_cookie", "value": "hello123"})
    response = driver.request.get(pages.url("echo_headers"))
    assert response.status == 200
    assert "hello123" in response.text()


def test_response_cookies_synced_to_browser(driver, pages):
    driver.request.get(pages.url("set_cookie?name=api_cookie&value=synced"))
    cookie = driver.get_cookie("api_cookie")
    assert cookie is not None
    assert cookie["value"] == "synced"


def test_response_json(driver, pages):
    response = driver.request.get(pages.url("echo_json"))
    data = response.json()
    assert isinstance(data, dict)
    assert data["status"] == "ok"


def test_response_text(driver, pages):
    response = driver.request.get(pages.url("echo_json"))
    text = response.text()
    assert isinstance(text, str)
    assert "ok" in text


def test_response_body_bytes(driver, pages):
    response = driver.request.get(pages.url("echo_json"))
    body = response.body()
    assert isinstance(body, bytes)
    assert b"ok" in body


def test_response_dispose(driver, pages):
    response = driver.request.get(pages.url("echo_json"))
    assert len(response.body()) > 0
    response.dispose()
    assert response.body() == b""


def test_response_headers(driver, pages):
    response = driver.request.get(pages.url("echo_json"))
    assert "content-type" in response.headers


def test_custom_headers(driver, pages):
    response = driver.request.get(
        pages.url("echo_headers"),
        headers={"X-Custom-Header": "custom_value_123"},
    )
    assert response.status == 200
    assert "custom_value_123" in response.text()


def test_base_url(driver, pages):
    ctx = APIRequestContext(driver, base_url=pages.url(""))
    response = ctx.get("simpleTest.html")
    assert response.status == 200
    assert "html" in response.text().lower()
    ctx.dispose()


def test_isolated_context_no_browser_sync(driver, pages):
    driver.delete_all_cookies()
    isolated = driver.request.new_context()
    isolated.get(pages.url("set_cookie?name=isolated_cookie&value=secret"))
    assert driver.get_cookie("isolated_cookie") is None
    isolated.dispose()


def test_storage_state_export(driver):
    driver.add_cookie({"name": "export_cookie", "value": "export_val"})
    state = driver.request.get_storage_state()
    assert "cookies" in state
    names = [c["name"] for c in state["cookies"]]
    assert "export_cookie" in names


def test_storage_state_to_file(driver):
    driver.add_cookie({"name": "file_cookie", "value": "file_val"})
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        tmp_path = f.name
    try:
        driver.request.get_storage_state(path=tmp_path)
        data = json.loads(Path(tmp_path).read_text())
        assert "cookies" in data
        names = [c["name"] for c in data["cookies"]]
        assert "file_cookie" in names
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def test_new_context_with_storage_state(driver):
    driver.add_cookie({"name": "state_cookie", "value": "state_val"})
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w") as f:
        tmp_path = f.name
    try:
        driver.request.get_storage_state(path=tmp_path)
        isolated = driver.request.new_context(storage_state=tmp_path)
        state = isolated.get_storage_state()
        names = [c["name"] for c in state["cookies"]]
        assert "state_cookie" in names
        isolated.dispose()
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def test_fetch_with_custom_method(driver, pages):
    response = driver.request.fetch(pages.url("simpleTest.html"), method="GET")
    assert response.status == 200
    assert response.ok


def test_fail_on_status_code_raises_on_404(driver, pages):
    with pytest.raises(APIRequestFailure) as exc_info:
        driver.request.get(
            pages.url("nonexistent_page_xyz.html"),
            fail_on_status_code=True,
        )
    assert exc_info.value.response.status == 404
    assert not exc_info.value.response.ok
    assert "404" in str(exc_info.value)
    assert "Not Found" in str(exc_info.value)


def test_fail_on_status_code_no_raise_on_200(driver, pages):
    response = driver.request.get(
        pages.url("simpleTest.html"),
        fail_on_status_code=True,
    )
    assert response.status == 200


def test_fail_on_status_code_instance_default(driver, pages):
    ctx = APIRequestContext(driver, fail_on_status_code=True)
    with pytest.raises(APIRequestFailure):
        ctx.get(pages.url("nonexistent_page_xyz.html"))
    ctx.dispose()


def test_fail_on_status_code_per_request_overrides_default(driver, pages):
    ctx = APIRequestContext(driver, fail_on_status_code=True)
    response = ctx.get(
        pages.url("nonexistent_page_xyz.html"),
        fail_on_status_code=False,
    )
    assert response.status == 404
    ctx.dispose()
