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

"""Uses the generated ``_bidi`` layer because the public ``bidi`` facade does not expose this command yet."""

import pytest

from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import BrowsingContext, CreateType, ReadinessState
from selenium.webdriver.common._bidi.script import ContextTarget, Script
from selenium.webdriver.common._bidi.user_agent_client_hints import (
    BrandVersion,
    ClientHintsMetadata,
    UserAgentClientHints,
)


def _eval(driver, expression, context_id):
    return Script(driver).evaluate(expression, ContextTarget(context=context_id), False).result.value


def _navigate(driver, pages, context_id):
    BrowsingContext(driver).navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)


def _fake_hints(platform):
    return ClientHintsMetadata(
        brands=[BrandVersion(brand="SeleniumBrowser", version="1")],
        platform=platform,
        mobile=True,
    )


@pytest.mark.xfail_firefox(reason="Firefox does not implement userAgentClientHints")
def test_set_client_hints_override_with_contexts(driver, pages):
    context_id = driver.current_window_handle
    client_hints = UserAgentClientHints(driver)
    try:
        client_hints.set_client_hints_override(_fake_hints("SeleniumOS"), contexts=[context_id])
        _navigate(driver, pages, context_id)

        assert _eval(driver, "navigator.userAgentData.platform", context_id) == "SeleniumOS"
        assert _eval(driver, "navigator.userAgentData.brands[0].brand", context_id) == "SeleniumBrowser"
        assert _eval(driver, "navigator.userAgentData.mobile", context_id) is True
    finally:
        client_hints.set_client_hints_override(None, contexts=[context_id])


@pytest.mark.xfail_firefox(reason="Firefox does not implement userAgentClientHints")
def test_clear_client_hints_override(driver, pages):
    context_id = driver.current_window_handle
    _navigate(driver, pages, context_id)
    initial_platform = _eval(driver, "navigator.userAgentData.platform", context_id)

    client_hints = UserAgentClientHints(driver)
    try:
        client_hints.set_client_hints_override(_fake_hints("SeleniumOS"), contexts=[context_id])
        _navigate(driver, pages, context_id)
        assert _eval(driver, "navigator.userAgentData.platform", context_id) == "SeleniumOS"
    finally:
        client_hints.set_client_hints_override(None, contexts=[context_id])

    _navigate(driver, pages, context_id)
    assert _eval(driver, "navigator.userAgentData.platform", context_id) == initial_platform


@pytest.mark.xfail_firefox(reason="Firefox does not implement userAgentClientHints")
def test_set_client_hints_override_with_user_contexts(driver, pages):
    user_context = Browser(driver).create_user_context().user_context
    try:
        UserAgentClientHints(driver).set_client_hints_override(
            _fake_hints("UserContextOS"), user_contexts=[user_context]
        )
        context_id = BrowsingContext(driver).create(type=CreateType.TAB, user_context=user_context).context
        try:
            _navigate(driver, pages, context_id)
            assert _eval(driver, "navigator.userAgentData.platform", context_id) == "UserContextOS"
        finally:
            BrowsingContext(driver).close(context=context_id)
    finally:
        Browser(driver).remove_user_context(user_context=user_context)
