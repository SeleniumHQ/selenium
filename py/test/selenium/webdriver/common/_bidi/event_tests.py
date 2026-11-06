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

"""Browser tests for the events of the generated ``_bidi`` layer, one per event a browser can be made to emit here."""

import queue

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.browsing_context import (
    BrowsingContext,
    CreateType,
    DownloadEndParamsCompleteParams,
    UserPromptType,
)
from selenium.webdriver.common._bidi.input import Input
from selenium.webdriver.common._bidi.log import ConsoleLogEntry, JavascriptLogEntry, Log
from selenium.webdriver.common._bidi.network import InterceptPhase, Network
from selenium.webdriver.common._bidi.script import (
    ChannelProperties,
    ChannelValue,
    ContextTarget,
    Script,
    WindowRealmInfo,
)
from selenium.webdriver.common._bidi.session import Session
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

UNREACHABLE_URL = "http://invalid-domain-that-does-not-exist.test/"


def test_callback_receives_the_raw_event_params_until_removed(driver, pages):
    loaded = []
    callback = BrowsingContext(driver).add_load_callback(lambda params: loaded.append(params["url"]))
    subscription = Session(driver).subscribe(events=[BrowsingContext.EVENTS["load"]]).subscription
    try:
        driver.get(pages.url("simpleTest.html"))
        WebDriverWait(driver, 5).until(lambda _: pages.url("simpleTest.html") in loaded)

        BrowsingContext(driver).remove_load_callback(callback)
        driver.get(pages.url("blank.html"))
        assert pages.url("blank.html") not in loaded
    finally:
        Session(driver).unsubscribe(subscriptions=[subscription])


class Events:
    """The events a callback has received, parsed with the payload class ``EVENT_TYPES`` names for them."""

    def __init__(self, payload):
        self._payload = payload
        self.received = queue.Queue()

    def first(self, matches=lambda event: True):
        while True:
            event = self._payload.from_json(self.received.get(timeout=10))
            if matches(event):
                return event


@pytest.fixture
def listen(driver):
    """Listen to a domain's event until the test ends: ``listen(BrowsingContext, "load")``."""
    listeners = []

    def start(domain, event):
        wire = domain.EVENTS[event]
        events = Events(domain.EVENT_TYPES[wire])
        callback = getattr(domain(driver), f"add_{event}_callback")(events.received.put)
        subscription = Session(driver).subscribe(events=[wire]).subscription
        listeners.append((subscription, getattr(domain(driver), f"remove_{event}_callback"), callback))
        return events

    yield start
    # A failed test has had its driver stopped by now, and its subscriptions went with it.
    if driver._websocket_connection is None:
        return
    for subscription, remove_callback, callback in listeners:
        Session(driver).unsubscribe(subscriptions=[subscription])
        remove_callback(callback)


# --- browsingContext ---


def test_context_created_event(driver, listen):
    created = listen(BrowsingContext, "context_created")

    context = BrowsingContext(driver).create(type=CreateType.TAB).context

    info = created.first(lambda info: info.context == context)
    BrowsingContext(driver).close(context=context)
    assert info.url == "about:blank"


def test_context_destroyed_event(driver, listen):
    context = BrowsingContext(driver).create(type=CreateType.TAB).context
    destroyed = listen(BrowsingContext, "context_destroyed")

    BrowsingContext(driver).close(context=context)

    assert destroyed.first().context == context


@pytest.mark.parametrize("event", ["navigation_started", "navigation_committed", "dom_content_loaded", "load"])
def test_navigation_events(driver, pages, listen, event):
    url = pages.url("simpleTest.html")
    navigated = listen(BrowsingContext, event)

    driver.get(url)

    assert navigated.first(lambda info: info.url == url).context == driver.current_window_handle


def test_fragment_navigated_event(driver, pages, listen):
    url = pages.url("linked_image.html")
    driver.get(url)
    navigated = listen(BrowsingContext, "fragment_navigated")

    driver.get(url + "#link")

    assert navigated.first().url == url + "#link"


@pytest.mark.xfail_firefox
def test_navigation_failed_event(driver, listen):
    failed = listen(BrowsingContext, "navigation_failed")

    with pytest.raises(WebDriverException):
        BrowsingContext(driver).navigate(context=driver.current_window_handle, url=UNREACHABLE_URL)

    assert failed.first().url == UNREACHABLE_URL


def test_history_updated_event(driver, pages, listen):
    driver.get(pages.url("simpleTest.html"))
    updated = listen(BrowsingContext, "history_updated")

    driver.execute_script("history.pushState({}, '', '/new-path')")

    assert updated.first().url.endswith("/new-path")


def test_user_prompt_opened_event(driver, pages, listen):
    driver.get(pages.url("alerts.html"))
    opened = listen(BrowsingContext, "user_prompt_opened")

    driver.find_element(By.ID, "alert").click()

    prompt = opened.first()
    BrowsingContext(driver).handle_user_prompt(context=driver.current_window_handle)
    assert (prompt.type, prompt.message) == (UserPromptType.ALERT, "cheese")


def test_user_prompt_closed_event(driver, pages, listen):
    driver.get(pages.url("alerts.html"))
    closed = listen(BrowsingContext, "user_prompt_closed")
    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    BrowsingContext(driver).handle_user_prompt(context=driver.current_window_handle, accept=True)

    assert closed.first().accepted is True


def test_download_will_begin_event(driver, pages, listen):
    driver.get(pages.url("downloads/download.html"))
    beginning = listen(BrowsingContext, "download_will_begin")

    driver.find_element(By.ID, "file-1").click()

    assert "file_1" in beginning.first().suggested_filename


def test_download_end_event(driver, pages, listen):
    driver.get(pages.url("downloads/download.html"))
    ended = listen(BrowsingContext, "download_end")

    driver.find_element(By.ID, "file-1").click()

    download = ended.first()
    assert isinstance(download, DownloadEndParamsCompleteParams)
    assert download.url == pages.url("downloads/file_1.txt")


# --- log ---


def test_entry_added_event_for_a_console_message(driver, pages, listen):
    driver.get(pages.url("bidi/logEntryAdded.html"))
    entries = listen(Log, "entry_added")

    driver.find_element(By.ID, "consoleLog").click()

    assert isinstance(entries.first(lambda entry: entry.text == "Hello, world!"), ConsoleLogEntry)


def test_entry_added_event_for_a_javascript_error(driver, pages, listen):
    driver.get(pages.url("bidi/logEntryAdded.html"))
    entries = listen(Log, "entry_added")

    driver.find_element(By.ID, "jsException").click()

    assert isinstance(entries.first(lambda entry: entry.text == "Error: Not working"), JavascriptLogEntry)


# --- input ---


@pytest.mark.xfail_firefox(reason="File dialog handling not implemented in Firefox yet")
def test_file_dialog_opened_event(driver, listen):
    driver.get("data:text/html,<input id=upload type=file multiple />")
    opened = listen(Input, "file_dialog_opened")

    Script(driver).evaluate(
        expression="document.getElementById('upload').click()",
        target=ContextTarget(context=driver.current_window_handle),
        await_promise=False,
        user_activation=True,
    )

    dialog = opened.first()
    assert (dialog.context, dialog.multiple) == (driver.current_window_handle, True)


# --- network ---


@pytest.mark.parametrize("event", ["before_request_sent", "response_started", "response_completed"])
def test_request_events(driver, pages, listen, event):
    url = pages.url("simpleTest.html")
    requests = listen(Network, event)

    driver.get(url)

    assert requests.first(lambda sent: sent.request.url == url).request.method == "GET"


def test_fetch_error_event(driver, pages, listen):
    driver.get(pages.url("simpleTest.html"))
    errors = listen(Network, "fetch_error")

    driver.execute_script("fetch(arguments[0]).catch(() => {})", UNREACHABLE_URL)

    assert errors.first(lambda error: error.request.url == UNREACHABLE_URL).error_text


@pytest.mark.xfail_chrome(reason="Chromium reports a response status of -1, which ResponseData rejects")
@pytest.mark.xfail_edge(reason="Chromium reports a response status of -1, which ResponseData rejects")
def test_auth_required_event(driver, pages, listen):
    driver.get(pages.url("simpleTest.html"))
    challenges = listen(Network, "auth_required")
    intercept = Network(driver).add_intercept(phases=[InterceptPhase.AUTH_REQUIRED]).intercept
    try:
        driver.execute_script("fetch(arguments[0])", pages.url("basic-auth"))
        challenge = challenges.first()
        Network(driver).continue_with_auth(request=challenge.request.request, action="cancel")
    finally:
        Network(driver).remove_intercept(intercept=intercept)
    assert challenge.response.status == 401


# --- script ---


def test_realm_created_event(driver, listen):
    created = listen(Script, "realm_created")

    context = BrowsingContext(driver).create(type=CreateType.TAB).context

    realm = created.first(lambda realm: getattr(realm, "context", None) == context)
    BrowsingContext(driver).close(context=context)
    assert isinstance(realm, WindowRealmInfo)


def test_realm_destroyed_event(driver, listen):
    context = BrowsingContext(driver).create(type=CreateType.TAB).context
    realms = {realm.realm for realm in Script(driver).get_realms(context=context).realms}
    destroyed = listen(Script, "realm_destroyed")

    BrowsingContext(driver).close(context=context)

    assert destroyed.first().realm in realms


def test_message_event(driver, listen):
    messages = listen(Script, "message")

    Script(driver).call_function(
        function_declaration="channel => channel('hello')",
        arguments=[ChannelValue(value=ChannelProperties(channel="greeting"))],
        target=ContextTarget(context=driver.current_window_handle),
        await_promise=False,
    )

    message = messages.first()
    assert (message.channel, message.data.value) == ("greeting", "hello")
