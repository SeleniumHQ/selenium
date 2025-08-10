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

import pytest

from selenium.webdriver.common.bidi.browsing_context import ReadinessState
from selenium.webdriver.common.by import By
from selenium.webdriver.common.window import WindowTypes
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def create_alert_page(driver, pages):
    """Create a page with an alert."""
    url = pages.url("alerts.html")
    driver.get(url)
    return url


def create_prompt_page(driver, pages):
    """Create a page with a prompt."""
    url = pages.url("javascriptPage.html")
    driver.get(url)
    return url


def test_browsing_context_initialized(driver):
    """Test that the browsing context module is initialized properly."""
    assert driver.browsing_context is not None


def test_create_window(driver):
    """Test creating a window."""
    context_id = driver.browsing_context.create(type=WindowTypes.WINDOW)
    assert context_id is not None

    # Clean up
    driver.browsing_context.close(context_id)


def test_create_window_with_reference_context(driver):
    """Test creating a window with a reference context."""
    reference_context = driver.current_window_handle
    context_id = driver.browsing_context.create(type=WindowTypes.WINDOW, reference_context=reference_context)
    assert context_id is not None

    # Clean up
    driver.browsing_context.close(context_id)


def test_create_tab(driver):
    """Test creating a tab."""
    context_id = driver.browsing_context.create(type=WindowTypes.TAB)
    assert context_id is not None

    # Clean up
    driver.browsing_context.close(context_id)


def test_create_tab_with_reference_context(driver):
    """Test creating a tab with a reference context."""
    reference_context = driver.current_window_handle
    context_id = driver.browsing_context.create(type=WindowTypes.TAB, reference_context=reference_context)
    assert context_id is not None

    # Clean up
    driver.browsing_context.close(context_id)


def test_create_context_with_all_parameters(driver):
    """Test creating a context with all parameters."""
    reference_context = driver.current_window_handle
    user_context = driver.browser.create_user_context()

    context_id = driver.browsing_context.create(
        type=WindowTypes.WINDOW, reference_context=reference_context, user_context=user_context, background=True
    )
    assert context_id is not None
    assert context_id != reference_context

    # Clean up
    driver.browsing_context.close(context_id)
    driver.browser.remove_user_context(user_context)


def test_navigate_to_url(driver, pages):
    """Test navigating to a URL."""
    context_id = driver.browsing_context.create(type=WindowTypes.TAB)

    url = pages.url("bidi/logEntryAdded.html")
    result = driver.browsing_context.navigate(context=context_id, url=url)

    assert context_id is not None
    assert "/bidi/logEntryAdded.html" in result["url"]

    # Clean up
    driver.browsing_context.close(context_id)


def test_navigate_to_url_with_readiness_state(driver, pages):
    """Test navigating to a URL with readiness state."""
    context_id = driver.browsing_context.create(type=WindowTypes.TAB)

    url = pages.url("bidi/logEntryAdded.html")
    result = driver.browsing_context.navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

    assert context_id is not None
    assert "/bidi/logEntryAdded.html" in result["url"]

    # Clean up
    driver.browsing_context.close(context_id)


def test_get_tree_with_child(driver, pages):
    """Test getting the tree with a child."""
    reference_context = driver.current_window_handle

    url = pages.url("iframes.html")
    driver.browsing_context.navigate(context=reference_context, url=url, wait=ReadinessState.COMPLETE)

    context_info_list = driver.browsing_context.get_tree(root=reference_context)

    assert len(context_info_list) == 1
    info = context_info_list[0]
    assert len(info.children) == 1
    assert info.context == reference_context
    assert "formPage.html" in info.children[0].url


def test_get_tree_with_depth(driver, pages):
    """Test getting the tree with depth."""
    reference_context = driver.current_window_handle

    url = pages.url("iframes.html")
    driver.browsing_context.navigate(context=reference_context, url=url, wait=ReadinessState.COMPLETE)

    context_info_list = driver.browsing_context.get_tree(root=reference_context, max_depth=0)

    assert len(context_info_list) == 1
    info = context_info_list[0]
    assert info.children is None  # since depth is 0
    assert info.context == reference_context


def test_get_all_top_level_contexts(driver):
    """Test getting all top-level contexts."""
    _ = driver.current_window_handle
    window_handle = driver.browsing_context.create(type=WindowTypes.WINDOW)

    context_info_list = driver.browsing_context.get_tree()

    assert len(context_info_list) == 2

    # Clean up
    driver.browsing_context.close(window_handle)


def test_close_window(driver):
    """Test closing a window."""
    window1 = driver.browsing_context.create(type=WindowTypes.WINDOW)
    window2 = driver.browsing_context.create(type=WindowTypes.WINDOW)

    driver.browsing_context.close(window2)

    with pytest.raises(Exception):
        driver.browsing_context.get_tree(root=window2)

    # Clean up
    driver.browsing_context.close(window1)


def test_close_tab(driver):
    """Test closing a tab."""
    tab1 = driver.browsing_context.create(type=WindowTypes.TAB)
    tab2 = driver.browsing_context.create(type=WindowTypes.TAB)

    driver.browsing_context.close(tab2)

    with pytest.raises(Exception):
        driver.browsing_context.get_tree(root=tab2)

    # Clean up
    driver.browsing_context.close(tab1)


def test_activate_browsing_context(driver):
    """Test activating a browsing context."""
    window1 = driver.current_window_handle
    # 2nd window is focused
    window2 = driver.browsing_context.create(type=WindowTypes.WINDOW)

    # We did not switch the driver, so we are running the script to check focus on 1st window
    assert not driver.execute_script("return document.hasFocus();")

    driver.browsing_context.activate(window1)

    assert driver.execute_script("return document.hasFocus();")

    # Clean up
    driver.browsing_context.close(window2)


def test_reload_browsing_context(driver, pages):
    """Test reloading a browsing context."""
    context_id = driver.browsing_context.create(type=WindowTypes.TAB)

    url = pages.url("bidi/logEntryAdded.html")
    driver.browsing_context.navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

    reload_info = driver.browsing_context.reload(context=context_id)

    assert "/bidi/logEntryAdded.html" in reload_info["url"]

    # Clean up
    driver.browsing_context.close(context_id)


def test_reload_with_readiness_state(driver, pages):
    """Test reloading with readiness state."""
    context_id = driver.browsing_context.create(type=WindowTypes.TAB)

    url = pages.url("bidi/logEntryAdded.html")
    driver.browsing_context.navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

    reload_info = driver.browsing_context.reload(context=context_id, wait=ReadinessState.COMPLETE)

    assert reload_info["navigation"] is not None
    assert "/bidi/logEntryAdded.html" in reload_info["url"]

    # Clean up
    driver.browsing_context.close(context_id)


def test_handle_user_prompt(driver, pages):
    """Test handling a user prompt."""
    context_id = driver.current_window_handle

    create_alert_page(driver, pages)

    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    driver.browsing_context.handle_user_prompt(context=context_id)

    assert "Alerts" in driver.title


def test_accept_user_prompt(driver, pages):
    """Test accepting a user prompt."""
    context_id = driver.current_window_handle

    create_alert_page(driver, pages)

    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    driver.browsing_context.handle_user_prompt(context=context_id, accept=True)

    assert "Alerts" in driver.title


def test_dismiss_user_prompt(driver, pages):
    """Test dismissing a user prompt."""
    context_id = driver.current_window_handle

    create_alert_page(driver, pages)

    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    driver.browsing_context.handle_user_prompt(context=context_id, accept=False)

    assert "Alerts" in driver.title


def test_pass_user_text_to_prompt(driver, pages):
    """Test passing user text to a prompt."""
    context_id = driver.current_window_handle

    create_prompt_page(driver, pages)

    driver.execute_script("prompt('Enter something')")
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    user_text = "Selenium automates browsers"

    driver.browsing_context.handle_user_prompt(context=context_id, user_text=user_text)

    # Check if the text was entered (this is browser-dependent)


def test_capture_screenshot(driver, pages):
    """Test capturing a screenshot."""
    context_id = driver.current_window_handle

    driver.get(pages.url("simpleTest.html"))

    screenshot = driver.browsing_context.capture_screenshot(context=context_id)

    # Verify it's a valid base64 string
    try:
        base64.b64decode(screenshot)
        is_valid = True
    except Exception:
        is_valid = False

    assert is_valid
    assert len(screenshot) > 0


def test_capture_screenshot_with_parameters(driver, pages):
    """Test capturing a screenshot with parameters."""
    context_id = driver.current_window_handle

    driver.get(pages.url("coordinates_tests/simple_page.html"))
    element = driver.find_element(By.ID, "box")

    rect = element.rect

    clip = {"type": "box", "x": rect["x"], "y": rect["y"], "width": 5, "height": 5}

    screenshot = driver.browsing_context.capture_screenshot(context=context_id, origin="document", clip=clip)

    assert len(screenshot) > 0


def test_set_viewport(driver, pages):
    """Test setting the viewport."""
    context_id = driver.current_window_handle
    driver.get(pages.url("formPage.html"))

    driver.browsing_context.set_viewport(context=context_id, viewport={"width": 250, "height": 300})

    viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")

    assert viewport_size[0] == 250
    assert viewport_size[1] == 300


def test_set_viewport_with_device_pixel_ratio(driver, pages):
    """Test setting the viewport with device pixel ratio."""
    context_id = driver.current_window_handle
    driver.get(pages.url("formPage.html"))

    driver.browsing_context.set_viewport(
        context=context_id, viewport={"width": 250, "height": 300}, device_pixel_ratio=5
    )

    viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")

    assert viewport_size[0] == 250
    assert viewport_size[1] == 300

    device_pixel_ratio = driver.execute_script("return window.devicePixelRatio")

    assert device_pixel_ratio == 5


def test_print_page(driver, pages):
    """Test printing a page."""
    context_id = driver.current_window_handle

    driver.get(pages.url("formPage.html"))

    print_result = driver.browsing_context.print(context=context_id)

    assert len(print_result) > 0
    # Check if it's a valid PDF (starts with JVBERi which is the base64 encoding of %PDF)
    assert "JVBERi" in print_result


def test_navigate_back_in_browser_history(driver, pages):
    """Test navigating back in the browser history."""
    context_id = driver.current_window_handle
    driver.browsing_context.navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    # Navigate to another page by submitting a form
    driver.find_element(By.ID, "imageButton").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))

    driver.browsing_context.traverse_history(context=context_id, delta=-1)
    WebDriverWait(driver, 5).until(EC.title_is("We Leave From Here"))


def test_navigate_forward_in_browser_history(driver, pages):
    """Test navigating forward in the browser history."""
    context_id = driver.current_window_handle
    driver.browsing_context.navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    # Navigate to another page by submitting a form
    driver.find_element(By.ID, "imageButton").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))

    # Go back
    driver.browsing_context.traverse_history(context=context_id, delta=-1)
    WebDriverWait(driver, 5).until(EC.title_is("We Leave From Here"))

    # Go forward
    driver.browsing_context.traverse_history(context=context_id, delta=1)
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))


# Tests for locate nodes
def test_locate_nodes(driver, pages):
    """Test locating nodes with CSS selector."""
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    elements = driver.browsing_context.locate_nodes(context=context_id, locator={"type": "css", "value": "div"})

    assert len(elements) > 0


def test_locate_nodes_with_css_locator(driver, pages):
    """Test locating nodes with specific CSS selector."""
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    elements = driver.browsing_context.locate_nodes(
        context=context_id, locator={"type": "css", "value": "div.extraDiv, div.content"}, max_node_count=1
    )

    assert len(elements) >= 1

    value = elements[0]
    assert value["type"] == "node"
    assert "value" in value
    assert "localName" in value["value"]
    assert value["value"]["localName"] == "div"
    assert "attributes" in value["value"]
    assert "class" in value["value"]["attributes"]
    assert value["value"]["attributes"]["class"] == "content"


def test_locate_nodes_with_xpath_locator(driver, pages):
    """Test locating nodes with XPath selector."""
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    elements = driver.browsing_context.locate_nodes(
        context=context_id, locator={"type": "xpath", "value": "/html/body/div[2]"}, max_node_count=1
    )

    assert len(elements) >= 1

    value = elements[0]
    assert value["type"] == "node"
    assert "value" in value
    assert "localName" in value["value"]
    assert value["value"]["localName"] == "div"
    assert "attributes" in value["value"]
    assert "class" in value["value"]["attributes"]
    assert value["value"]["attributes"]["class"] == "content"


@pytest.mark.xfail_firefox
def test_locate_nodes_with_inner_text(driver, pages):
    """Test locating nodes with innerText selector."""
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    elements = driver.browsing_context.locate_nodes(
        context=context_id, locator={"type": "innerText", "value": "Spaced out"}, max_node_count=1
    )

    assert len(elements) >= 1

    value = elements[0]
    assert value["type"] == "node"
    assert "value" in value


def test_locate_nodes_with_max_node_count(driver, pages):
    """Test locating nodes with maximum node count."""
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    elements = driver.browsing_context.locate_nodes(
        context=context_id, locator={"type": "css", "value": "div"}, max_node_count=4
    )

    assert len(elements) == 4


def test_locate_nodes_given_start_nodes(driver, pages):
    """Test locating nodes with start nodes."""
    context_id = driver.current_window_handle

    driver.get(pages.url("formPage.html"))

    form_elements = driver.browsing_context.locate_nodes(
        context=context_id, locator={"type": "css", "value": "form[name='login']"}
    )

    assert len(form_elements) == 1

    form_shared_id = form_elements[0]["sharedId"]

    elements = driver.browsing_context.locate_nodes(
        context=context_id,
        locator={"type": "css", "value": "input"},
        start_nodes=[{"sharedId": form_shared_id}],
        max_node_count=50,
    )
    # The login form should have 3 input elements (email, age, and submit button)
    assert len(elements) == 3
