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

import pytest

from selenium.webdriver.common.bidi.browsing_context import ReadinessState
from selenium.webdriver.common.bidi.speculation import PreloadingStatus
from selenium.webdriver.support.ui import WebDriverWait


def _add_speculation_rules_and_link(driver, prefetch_url):
    driver.execute_script(f"addSpeculationRulesAndLink('{prefetch_url}')")


def test_speculation_module_initialized(driver):
    assert driver.speculation is not None


def test_prefetch_status_updated_with_pending_and_ready_events(driver, pages):
    """Test that prefetch status updated events are received with pending and ready statuses."""
    events_received = []

    def on_prefetch_status_updated(event):
        events_received.append(event)

    callback_id = driver.speculation.add_event_handler("prefetch_status_updated", on_prefetch_status_updated)

    try:
        url = pages.url("bidi/speculationRules.html")
        prefetch_url = pages.url("bidi/emptyPage.html")
        driver.browsing_context.navigate(
            context=driver.current_window_handle,
            url=url,
            wait=ReadinessState.COMPLETE,
        )

        _add_speculation_rules_and_link(driver, prefetch_url)

        # Wait for at least two events (pending + ready)
        WebDriverWait(driver, 10).until(lambda _: len(events_received) >= 2)

        statuses = {event.status for event in events_received}
        assert PreloadingStatus.PENDING in statuses
        assert PreloadingStatus.READY in statuses

        # Verify event fields
        for event in events_received:
            assert event.context == driver.current_window_handle
            assert prefetch_url in event.url
            assert event.status in PreloadingStatus.VALID_STATUSES
    finally:
        driver.speculation.remove_event_handler("prefetch_status_updated", callback_id)


def test_prefetch_status_updated_with_navigation_and_success(driver, pages):
    """Test that navigating to a prefetched page via link click generates a success status event."""
    events_received = []

    def on_prefetch_status_updated(event):
        events_received.append(event)

    callback_id = driver.speculation.add_event_handler("prefetch_status_updated", on_prefetch_status_updated)

    try:
        url = pages.url("bidi/speculationRules.html")
        prefetch_url = pages.url("bidi/emptyPage.html")
        driver.browsing_context.navigate(
            context=driver.current_window_handle,
            url=url,
            wait=ReadinessState.COMPLETE,
        )

        _add_speculation_rules_and_link(driver, prefetch_url)

        # Wait for prefetch to be ready
        WebDriverWait(driver, 10).until(
            lambda _: any(event.status == PreloadingStatus.READY for event in events_received)
        )

        # Click the prefetch link to activate the prefetched resource
        driver.execute_script("document.getElementById('prefetch-link').click()")

        WebDriverWait(driver, 10).until(
            lambda _: any(event.status == PreloadingStatus.SUCCESS for event in events_received)
        )

        statuses = {event.status for event in events_received}
        assert PreloadingStatus.SUCCESS in statuses

        success_event = next(e for e in events_received if e.status == PreloadingStatus.SUCCESS)
        assert prefetch_url in success_event.url
        assert success_event.context == driver.current_window_handle
    finally:
        driver.speculation.remove_event_handler("prefetch_status_updated", callback_id)


def test_prefetch_status_updated_with_failure_events(driver, pages):
    """Test that a failed prefetch generates failure status events."""
    events_received = []

    def on_prefetch_status_updated(event):
        events_received.append(event)

    callback_id = driver.speculation.add_event_handler("prefetch_status_updated", on_prefetch_status_updated)

    try:
        url = pages.url("bidi/speculationRules.html")
        # Target a non-existent page to trigger failure
        prefetch_url = pages.url("nonexistent_page_404")
        driver.browsing_context.navigate(
            context=driver.current_window_handle,
            url=url,
            wait=ReadinessState.COMPLETE,
        )

        _add_speculation_rules_and_link(driver, prefetch_url)

        # Wait for failure or pending event
        WebDriverWait(driver, 10).until(lambda _: len(events_received) >= 1)

        statuses = {event.status for event in events_received}
        assert statuses.issubset({PreloadingStatus.PENDING, PreloadingStatus.FAILURE})
    finally:
        driver.speculation.remove_event_handler("prefetch_status_updated", callback_id)


def test_can_unsubscribe_from_prefetch_status_updated(driver, pages):
    """Test that events are no longer received after removing the handler."""
    events_received = []

    def on_prefetch_status_updated(event):
        events_received.append(event)

    callback_id = driver.speculation.add_event_handler("prefetch_status_updated", on_prefetch_status_updated)

    try:
        url = pages.url("bidi/speculationRules.html")
        prefetch_url = pages.url("bidi/emptyPage.html")
        driver.browsing_context.navigate(
            context=driver.current_window_handle,
            url=url,
            wait=ReadinessState.COMPLETE,
        )

        _add_speculation_rules_and_link(driver, prefetch_url)

        # Wait for initial events
        WebDriverWait(driver, 10).until(lambda _: len(events_received) >= 1)

        initial_count = len(events_received)

        # Unsubscribe from events
        driver.speculation.remove_event_handler("prefetch_status_updated", callback_id)

        # Reload and trigger new speculation rules with different target
        driver.browsing_context.navigate(
            context=driver.current_window_handle,
            url=url,
            wait=ReadinessState.COMPLETE,
        )

        second_prefetch_url = pages.url("blank.html")
        _add_speculation_rules_and_link(driver, second_prefetch_url)

        assert len(events_received) == initial_count
    except Exception:
        # Only try to remove if we haven't already
        driver.speculation.clear_event_handlers()
        raise


def test_invalid_event_raises_error(driver):
    """Test that subscribing to an invalid event name raises ValueError."""
    with pytest.raises(ValueError, match="Event 'invalid_event' not found"):
        driver.speculation.add_event_handler("invalid_event", lambda e: None)
