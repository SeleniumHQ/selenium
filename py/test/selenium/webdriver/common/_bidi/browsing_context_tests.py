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

"""Mirror of ``../bidi/browsing_context_tests.py`` using the generated ``_bidi`` commands, not the ``driver`` facade."""

import base64

import pytest

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common._bidi.browser import Browser
from selenium.webdriver.common._bidi.browsing_context import (
    BoxClipRectangle,
    BrowsingContext,
    CaptureScreenshotParametersOrigin,
    CreateType,
    CssLocator,
    InnerTextLocator,
    ReadinessState,
    Viewport,
    XPathLocator,
)
from selenium.webdriver.common._bidi.script import SharedReference
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def create_alert_page(driver, pages):
    url = pages.url("alerts.html")
    driver.get(url)
    return url


def create_prompt_page(driver, pages):
    url = pages.url("javascriptPage.html")
    driver.get(url)
    return url


def test_create_window(driver):
    bc = BrowsingContext(driver)
    context_id = bc.create(type=CreateType.WINDOW).context
    assert context_id is not None

    bc.close(context=context_id)


def test_create_window_with_reference_context(driver):
    bc = BrowsingContext(driver)
    reference_context = driver.current_window_handle
    context_id = bc.create(type=CreateType.WINDOW, reference_context=reference_context).context
    assert context_id is not None

    bc.close(context=context_id)


def test_create_tab(driver):
    bc = BrowsingContext(driver)
    context_id = bc.create(type=CreateType.TAB).context
    assert context_id is not None

    bc.close(context=context_id)


def test_create_tab_with_reference_context(driver):
    bc = BrowsingContext(driver)
    reference_context = driver.current_window_handle
    context_id = bc.create(type=CreateType.TAB, reference_context=reference_context).context
    assert context_id is not None

    bc.close(context=context_id)


def test_create_context_with_all_parameters(driver):
    bc = BrowsingContext(driver)
    reference_context = driver.current_window_handle
    user_context = Browser(driver).create_user_context().user_context

    context_id = bc.create(
        type=CreateType.WINDOW,
        reference_context=reference_context,
        user_context=user_context,
        background=True,
    ).context
    assert context_id is not None
    assert context_id != reference_context

    bc.close(context=context_id)
    Browser(driver).remove_user_context(user_context=user_context)


def test_navigate_to_url(driver, pages):
    bc = BrowsingContext(driver)
    context_id = bc.create(type=CreateType.TAB).context

    url = pages.url("bidi/logEntryAdded.html")
    result = bc.navigate(context=context_id, url=url)

    assert "/bidi/logEntryAdded.html" in result.url

    bc.close(context=context_id)


def test_navigate_to_url_with_readiness_state(driver, pages):
    bc = BrowsingContext(driver)
    context_id = bc.create(type=CreateType.TAB).context

    url = pages.url("bidi/logEntryAdded.html")
    result = bc.navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

    assert "/bidi/logEntryAdded.html" in result.url

    bc.close(context=context_id)


def test_get_tree_with_child(driver, pages):
    bc = BrowsingContext(driver)
    reference_context = driver.current_window_handle

    url = pages.url("iframes.html")
    bc.navigate(context=reference_context, url=url, wait=ReadinessState.COMPLETE)

    contexts = bc.get_tree(root=reference_context).contexts

    assert len(contexts) == 1
    info = contexts[0]
    assert len(info.children) == 1
    assert info.context == reference_context
    assert "formPage.html" in info.children[0].url


def test_get_tree_with_depth(driver, pages):
    bc = BrowsingContext(driver)
    reference_context = driver.current_window_handle

    url = pages.url("iframes.html")
    bc.navigate(context=reference_context, url=url, wait=ReadinessState.COMPLETE)

    contexts = bc.get_tree(root=reference_context, max_depth=0).contexts

    assert len(contexts) == 1
    info = contexts[0]
    assert info.children is None
    assert info.context == reference_context


def test_get_all_top_level_contexts(driver):
    bc = BrowsingContext(driver)
    window_handle = bc.create(type=CreateType.WINDOW).context

    contexts = bc.get_tree().contexts

    assert len(contexts) == 2

    bc.close(context=window_handle)


def test_close_window(driver):
    bc = BrowsingContext(driver)
    window1 = bc.create(type=CreateType.WINDOW).context
    window2 = bc.create(type=CreateType.WINDOW).context

    bc.close(context=window2)

    with pytest.raises(Exception):
        bc.get_tree(root=window2)

    bc.close(context=window1)


def test_close_tab(driver):
    bc = BrowsingContext(driver)
    tab1 = bc.create(type=CreateType.TAB).context
    tab2 = bc.create(type=CreateType.TAB).context

    bc.close(context=tab2)

    with pytest.raises(Exception):
        bc.get_tree(root=tab2)

    bc.close(context=tab1)


def test_activate_browsing_context(driver, headless):
    bc = BrowsingContext(driver)
    window1 = driver.current_window_handle
    window2 = bc.create(type=CreateType.WINDOW).context

    # Focus is handed over asynchronously, so poll rather than reading once. Headless
    # Chromium has no window manager and never hands it over at all, so skip there
    # instead of failing; headless Firefox does, and keeps the full assertions.
    try:
        WebDriverWait(driver, 5).until_not(lambda d: d.execute_script("return document.hasFocus();"))
    except TimeoutException:
        if headless:
            bc.close(context=window2)
            pytest.skip("this headless browser does not move focus between windows")
        raise

    bc.activate(context=window1)

    WebDriverWait(driver, 5).until(lambda d: d.execute_script("return document.hasFocus();"))
    assert driver.execute_script("return document.hasFocus();")

    bc.close(context=window2)


def test_reload_browsing_context(driver, pages):
    bc = BrowsingContext(driver)
    context_id = bc.create(type=CreateType.TAB).context

    url = pages.url("bidi/logEntryAdded.html")
    bc.navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

    reload_info = bc.reload(context=context_id)

    assert "/bidi/logEntryAdded.html" in reload_info.url

    bc.close(context=context_id)


def test_reload_with_readiness_state(driver, pages):
    bc = BrowsingContext(driver)
    context_id = bc.create(type=CreateType.TAB).context

    url = pages.url("bidi/logEntryAdded.html")
    bc.navigate(context=context_id, url=url, wait=ReadinessState.COMPLETE)

    reload_info = bc.reload(context=context_id, wait=ReadinessState.COMPLETE)

    assert reload_info.navigation is not None
    assert "/bidi/logEntryAdded.html" in reload_info.url

    bc.close(context=context_id)


def test_handle_user_prompt(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    create_alert_page(driver, pages)

    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    bc.handle_user_prompt(context=context_id)

    assert "Alerts" in driver.title


def test_accept_user_prompt(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    create_alert_page(driver, pages)

    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    bc.handle_user_prompt(context=context_id, accept=True)

    assert "Alerts" in driver.title


def test_dismiss_user_prompt(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    create_alert_page(driver, pages)

    driver.find_element(By.ID, "alert").click()
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    bc.handle_user_prompt(context=context_id, accept=False)

    assert "Alerts" in driver.title


def test_pass_user_text_to_prompt(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    create_prompt_page(driver, pages)

    driver.execute_script("prompt('Enter something')")
    WebDriverWait(driver, 5).until(EC.alert_is_present())

    user_text = "Selenium automates browsers"

    bc.handle_user_prompt(context=context_id, user_text=user_text)


def test_capture_screenshot(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("simpleTest.html"))

    screenshot = bc.capture_screenshot(context=context_id).data

    try:
        base64.b64decode(screenshot)
        is_valid = True
    except Exception:
        is_valid = False

    assert is_valid
    assert len(screenshot) > 0


def test_capture_screenshot_with_parameters(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("coordinates_tests/simple_page.html"))
    element = driver.find_element(By.ID, "box")

    rect = element.rect

    clip = BoxClipRectangle(x=rect["x"], y=rect["y"], width=5, height=5)

    screenshot = bc.capture_screenshot(
        context=context_id,
        origin=CaptureScreenshotParametersOrigin.DOCUMENT,
        clip=clip,
    ).data

    assert len(screenshot) > 0


def test_set_viewport(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle
    driver.get(pages.url("formPage.html"))

    try:
        bc.set_viewport(context=context_id, viewport=Viewport(width=251, height=301))

        viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")

        assert viewport_size[0] == 251
        assert viewport_size[1] == 301
    finally:
        bc.set_viewport(context=context_id, viewport=None, device_pixel_ratio=None)


def test_set_viewport_with_device_pixel_ratio(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle
    driver.get(pages.url("formPage.html"))

    try:
        bc.set_viewport(context=context_id, viewport=Viewport(width=252, height=302), device_pixel_ratio=5)

        viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")

        assert viewport_size[0] == 252
        assert viewport_size[1] == 302

        device_pixel_ratio = driver.execute_script("return window.devicePixelRatio")

        assert device_pixel_ratio == 5
    finally:
        bc.set_viewport(context=context_id, viewport=None, device_pixel_ratio=None)


def test_set_viewport_with_no_args_doesnt_change_values(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle
    driver.get(pages.url("formPage.html"))

    try:
        bc.set_viewport(context=context_id, viewport=Viewport(width=253, height=303), device_pixel_ratio=6)

        bc.set_viewport(context=context_id)

        viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")

        assert viewport_size[0] == 253
        assert viewport_size[1] == 303

        device_pixel_ratio = driver.execute_script("return window.devicePixelRatio")

        assert device_pixel_ratio == 6
    finally:
        bc.set_viewport(context=context_id, viewport=None, device_pixel_ratio=None)


@pytest.mark.xfail_chrome
def test_set_viewport_back_to_default(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle
    driver.get(pages.url("formPage.html"))

    default_viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")
    default_device_pixel_ratio = driver.execute_script("return window.devicePixelRatio")

    try:
        bc.set_viewport(context=context_id, viewport=Viewport(width=254, height=304), device_pixel_ratio=10)

        bc.set_viewport(context=context_id, viewport=None, device_pixel_ratio=None)

        viewport_size = driver.execute_script("return [window.innerWidth, window.innerHeight];")
        device_pixel_ratio = driver.execute_script("return window.devicePixelRatio")

        assert abs(viewport_size[0] - default_viewport_size[0]) <= 5
        assert abs(viewport_size[1] - default_viewport_size[1]) <= 5
        assert device_pixel_ratio == default_device_pixel_ratio
    finally:
        bc.set_viewport(context=context_id, viewport=None, device_pixel_ratio=None)


def test_print_page(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("formPage.html"))

    print_result = bc.print(context=context_id).data

    assert len(print_result) > 0
    # Valid PDF starts with JVBERi (base64 of %PDF)
    assert "JVBERi" in print_result


def test_navigate_back_in_browser_history(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle
    bc.navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    driver.find_element(By.ID, "imageButton").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))

    bc.traverse_history(context=context_id, delta=-1)
    WebDriverWait(driver, 5).until(EC.title_is("We Leave From Here"))


def test_navigate_forward_in_browser_history(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle
    bc.navigate(context=context_id, url=pages.url("formPage.html"), wait=ReadinessState.COMPLETE)

    driver.find_element(By.ID, "imageButton").submit()
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))

    bc.traverse_history(context=context_id, delta=-1)
    WebDriverWait(driver, 5).until(EC.title_is("We Leave From Here"))

    bc.traverse_history(context=context_id, delta=1)
    WebDriverWait(driver, 5).until(EC.title_is("We Arrive Here"))


def test_locate_nodes(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    nodes = bc.locate_nodes(context=context_id, locator=CssLocator(value="div")).nodes

    assert len(nodes) > 0


def test_locate_nodes_with_css_locator(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    nodes = bc.locate_nodes(
        context=context_id,
        locator=CssLocator(value="div.extraDiv, div.content"),
        max_node_count=1,
    ).nodes

    assert len(nodes) >= 1

    node = nodes[0]
    assert node.type == "node"
    assert node.value.local_name == "div"
    assert node.value.attributes["class"] == "content"


def test_locate_nodes_with_xpath_locator(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    nodes = bc.locate_nodes(
        context=context_id,
        locator=XPathLocator(value="/html/body/div[2]"),
        max_node_count=1,
    ).nodes

    assert len(nodes) >= 1

    node = nodes[0]
    assert node.type == "node"
    assert node.value.local_name == "div"
    assert node.value.attributes["class"] == "content"


@pytest.mark.xfail_firefox
def test_locate_nodes_with_inner_text(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    nodes = bc.locate_nodes(
        context=context_id,
        locator=InnerTextLocator(value="Spaced out"),
        max_node_count=1,
    ).nodes

    assert len(nodes) >= 1
    assert nodes[0].type == "node"


def test_locate_nodes_with_max_node_count(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("xhtmlTest.html"))

    nodes = bc.locate_nodes(context=context_id, locator=CssLocator(value="div"), max_node_count=4).nodes

    assert len(nodes) == 4


def test_locate_nodes_given_start_nodes(driver, pages):
    bc = BrowsingContext(driver)
    context_id = driver.current_window_handle

    driver.get(pages.url("formPage.html"))

    form_nodes = bc.locate_nodes(context=context_id, locator=CssLocator(value="form[name='login']")).nodes

    assert len(form_nodes) == 1

    form_shared_id = form_nodes[0].shared_id

    nodes = bc.locate_nodes(
        context=context_id,
        locator=CssLocator(value="input"),
        start_nodes=[SharedReference(shared_id=form_shared_id)],
        max_node_count=50,
    ).nodes
    # The login form has 3 input elements (email, age, and submit button)
    assert len(nodes) == 3
