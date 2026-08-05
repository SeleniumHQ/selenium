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

"""Integration tests for the native element-actionability layer.

Complements the DOM-mutation quiescence oracle (``bidi_dom_quiescence_tests.py``)
with an element-level layer: is *this element* visible, enabled, editable,
in view, unobstructed, and not moving. Built natively in
``window.__quiescence`` rather than vendoring a third-party library (see
``.local/plans/acquiescence-gap-analysis.md``).
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait


def _navigate(driver, pages, name):
    """Navigate to a served page via BiDi, which registers the preload."""
    driver.browsing_context.navigate(
        context=driver.current_window_handle,
        url=pages.url(name),
        wait="complete",
    )


def _element_state(driver, element):
    return driver.execute_script("return window.__quiescence.elementState(arguments[0]);", element)


# ---------------------------------------------------------------------------
# Slice A: element state inspector
# ---------------------------------------------------------------------------


def test_display_none_element_is_not_visible(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<div id=\"t\" style=\"display:none\">x</div>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["visible"] is False


def test_visibility_hidden_element_is_not_visible(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<div id=\"t\" style=\"visibility:hidden\">x</div>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["visible"] is False


def test_zero_size_element_is_not_visible(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<div id=\"t\" style=\"width:0;height:0;overflow:hidden\">x</div>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["visible"] is False


def test_opacity_zero_element_is_not_visible(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<div id=\"t\" style=\"opacity:0\">x</div>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["visible"] is False


def test_ordinary_element_is_visible_enabled(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\">go</button>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["visible"] is True
    assert state["enabled"] is True


def test_disabled_button_is_not_enabled(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\" disabled>go</button>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["enabled"] is False


def test_button_in_disabled_fieldset_is_not_enabled(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = '<fieldset disabled><button id=\"t\">go</button></fieldset>';"
    )

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["enabled"] is False


def test_readonly_input_is_not_editable(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<input id=\"t\" readonly value=\"x\">';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["editable"] is False


def test_plain_input_is_editable(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<input id=\"t\">';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["editable"] is True


def test_contenteditable_div_is_editable(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<div id=\"t\" contenteditable=\"true\">x</div>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["editable"] is True


def test_aria_readonly_div_is_not_editable(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = '<div id=\"t\" contenteditable=\"true\" aria-readonly=\"true\">x</div>';"
    )

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["editable"] is False


def test_indeterminate_checkbox_is_reported(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = '<input id=\"t\" type=\"checkbox\">';"
        "document.getElementById('t').indeterminate = true;"
    )

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["indeterminate"] is True
    assert state["checked"] is False


def test_checked_checkbox_is_reported(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<input id=\"t\" type=\"checkbox\" checked>';")

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["checked"] is True


def test_element_scrolled_out_of_ancestor_is_not_in_viewport(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"scroller\" style=\"width:100px;height:100px;overflow:auto;position:relative\">"
        "<div id=\"t\" style=\"position:relative;top:500px;width:20px;height:20px\">x</div></div>';"
    )

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["inViewport"] is False
    assert state["visibleRect"] is None


def test_element_in_view_reports_visible_rect(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = '<div id=\"t\" style=\"width:20px;height:20px\">x</div>';"
    )

    state = _element_state(driver, driver.find_element(By.ID, "t"))

    assert state["inViewport"] is True
    assert state["visibleRect"]["width"] > 0
    assert state["visibleRect"]["height"] > 0


# ---------------------------------------------------------------------------
# Slice B: `stable` (rect-motion) detection
# ---------------------------------------------------------------------------


def _is_stable(driver, element):
    return driver.execute_async_script(
        "const done = arguments[arguments.length - 1];"
        "window.__quiescence.isStable(arguments[0]).then(done);",
        element,
    )


def test_stationary_element_is_stable(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<div id=\"t\" style=\"width:20px;height:20px\">x</div>';")

    assert _is_stable(driver, driver.find_element(By.ID, "t")) is True


def test_transitioning_element_is_not_stable(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"t\" style=\"width:20px;height:20px;transition:transform 1200ms linear\">x</div>';"
        "document.getElementById('t').getBoundingClientRect();"
        "document.getElementById('t').style.transform = 'translateX(300px)';"
    )

    assert _is_stable(driver, driver.find_element(By.ID, "t")) is False


def test_element_becomes_stable_after_transition_ends(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"t\" style=\"width:20px;height:20px;transition:transform 200ms linear\">x</div>';"
        "document.getElementById('t').getBoundingClientRect();"
        "document.getElementById('t').style.transform = 'translateX(60px)';"
    )

    WebDriverWait(driver, 3).until(lambda d: _is_stable(d, d.find_element(By.ID, "t")) or False)


# ---------------------------------------------------------------------------
# Slice C: interaction point + obstruction (hit-testing)
# ---------------------------------------------------------------------------


def _interaction_point(driver, element):
    return driver.execute_script("return window.__quiescence.interactionPoint(arguments[0]);", element)


def test_unobstructed_element_reports_point_with_no_reason(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\">go</button>';")

    result = _interaction_point(driver, driver.find_element(By.ID, "t"))

    assert result["reason"] is None
    assert result["obstructedBy"] is None
    assert result["point"]["x"] > 0
    assert result["point"]["y"] > 0


def test_element_under_overlay_is_obstructed(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"t\" style=\"position:absolute;top:50px;left:50px;width:100px;height:30px\">target</div>"
        "<div id=\"overlay\" style=\"position:absolute;top:50px;left:50px;width:100px;height:30px;z-index:5\">covering</div>';"
    )

    result = _interaction_point(driver, driver.find_element(By.ID, "t"))

    assert result["reason"] == "obstructed"
    assert result["obstructedBy"] == "div#overlay"


def test_offscreen_element_reports_notinview(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"t\" style=\"position:fixed;top:-9999px;left:-9999px;width:20px;height:20px\">x</div>';"
    )

    result = _interaction_point(driver, driver.find_element(By.ID, "t"))

    assert result["reason"] == "notinview"
    assert result["point"] is None


def test_shadow_element_obstructed_by_light_dom_overlay(driver, pages):
    _navigate(driver, pages, "blank.html")
    inner = driver.execute_script(
        "const host = document.createElement('div');"
        "host.style.cssText = 'position:absolute;top:100px;left:100px;width:50px;height:50px';"
        "document.body.appendChild(host);"
        "const sr = host.attachShadow({mode: 'open'});"
        "const inner = document.createElement('div');"
        "inner.style.cssText = 'width:50px;height:50px;background:green';"
        "sr.appendChild(inner);"
        "const overlay = document.createElement('div'); overlay.id = 'overlay';"
        "overlay.style.cssText = "
        "'position:absolute;top:100px;left:100px;width:50px;height:50px;z-index:5';"
        "document.body.appendChild(overlay);"
        "return inner;"
    )

    result = _interaction_point(driver, inner)

    assert result["reason"] == "obstructed"
    assert result["obstructedBy"] == "div#overlay"


def test_open_shadow_element_reports_no_false_obstruction(driver, pages):
    _navigate(driver, pages, "blank.html")
    inner = driver.execute_script(
        "const host = document.createElement('div');"
        "host.style.cssText = 'position:absolute;top:200px;left:100px;width:50px;height:50px';"
        "document.body.appendChild(host);"
        "const sr = host.attachShadow({mode: 'open'});"
        "const inner = document.createElement('div');"
        "inner.style.cssText = 'width:50px;height:50px;background:green';"
        "sr.appendChild(inner);"
        "return inner;"
    )

    result = _interaction_point(driver, inner)

    assert result["reason"] is None
    assert result["obstructedBy"] is None


# ---------------------------------------------------------------------------
# Slice D: waitForInteractionReady(el, opts)
# ---------------------------------------------------------------------------


def _wait_for_interaction_ready(driver, element, interaction="click", timeout_ms=3000, auto_scroll=True):
    return driver.execute_async_script(
        "const done = arguments[arguments.length - 1];"
        "window.__quiescence.waitForInteractionReady(arguments[0], {"
        "  interaction: arguments[1], timeoutMs: arguments[2], autoScroll: arguments[3]"
        "}).then(done);",
        element,
        interaction,
        timeout_ms,
        auto_scroll,
    )


def test_ready_element_resolves_immediately(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\">go</button>';")

    result = _wait_for_interaction_ready(driver, driver.find_element(By.ID, "t"), timeout_ms=1000)

    assert result["ready"] is True
    assert result["interactionPoint"]["x"] > 0


def test_scrolled_off_element_becomes_ready_after_autoscroll(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"scroller\" style=\"width:100px;height:100px;overflow:auto;position:relative\">"
        "<div id=\"t\" style=\"position:relative;top:500px;width:20px;height:20px\">x</div></div>';"
    )

    result = _wait_for_interaction_ready(driver, driver.find_element(By.ID, "t"), timeout_ms=3000)

    assert result["ready"] is True


def test_obstructed_element_times_out_with_reason(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"t\" style=\"position:absolute;top:50px;left:50px;width:100px;height:30px\">target</div>"
        "<div id=\"overlay\" style=\"position:absolute;top:50px;left:50px;width:100px;height:30px;z-index:5\">covering</div>';"
    )

    result = _wait_for_interaction_ready(driver, driver.find_element(By.ID, "t"), timeout_ms=800)

    assert result["ready"] is False
    assert "obstructed" in result["reason"]


def test_disabled_element_never_becomes_ready(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\" disabled>go</button>';")

    result = _wait_for_interaction_ready(driver, driver.find_element(By.ID, "t"), timeout_ms=500)

    assert result["ready"] is False
    assert "enabled" in result["reason"]


# ---------------------------------------------------------------------------
# Slice E: composition + driver.wait_until_actionable()
# ---------------------------------------------------------------------------


def test_wait_until_actionable_returns_ready_for_ordinary_button(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\">go</button>';")

    result = driver.wait_until_actionable(driver.find_element(By.ID, "t"), timeout=2)

    assert result["ready"] is True


def test_wait_until_actionable_waits_for_dom_settle_and_element_reveal(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = '<button id=\"t\" style=\"display:none\">go</button>';"
        "setTimeout(() => { document.getElementById('t').style.display = 'inline-block'; }, 300);"
    )
    button = driver.find_element(By.ID, "t")

    result = driver.wait_until_actionable(button, timeout=3)

    assert result["ready"] is True
    assert result["elapsedMs"] >= 250


def test_wait_until_actionable_reports_obstruction_reason(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"t\" style=\"position:absolute;top:50px;left:50px;width:100px;height:30px\">target</div>"
        "<div id=\"overlay\" style=\"position:absolute;top:50px;left:50px;width:100px;height:30px;z-index:5\">covering</div>';"
    )

    result = driver.wait_until_actionable(driver.find_element(By.ID, "t"), timeout=1)

    assert result["ready"] is False
    assert "obstructed" in result["reason"]


def test_wait_until_actionable_scrolls_element_into_view(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script(
        "document.body.innerHTML = "
        "'<div id=\"scroller\" style=\"width:100px;height:100px;overflow:auto;position:relative\">"
        "<div id=\"t\" style=\"position:relative;top:500px;width:20px;height:20px\">x</div></div>';"
    )

    result = driver.wait_until_actionable(driver.find_element(By.ID, "t"), timeout=3)

    assert result["ready"] is True


def test_wait_until_actionable_disabled_element_times_out(driver, pages):
    _navigate(driver, pages, "blank.html")
    driver.execute_script("document.body.innerHTML = '<button id=\"t\" disabled>go</button>';")

    result = driver.wait_until_actionable(driver.find_element(By.ID, "t"), timeout=0.5)

    assert result["ready"] is False
