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

import re
from collections.abc import Iterable
from typing import Any, Callable, Literal, TypeVar, Union

from selenium.common.exceptions import (
    NoAlertPresentException,
    NoSuchElementException,
    NoSuchFrameException,
    StaleElementReferenceException,
    WebDriverException,
)
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.remote.webdriver import WebDriver, WebElement

"""
 * Canned "Expected Conditions" which are generally useful within webdriver
 * tests.
"""

D = TypeVar("D")
T = TypeVar("T")

WebDriverOrWebElement = Union[WebDriver, WebElement]


def title_is(title: str) -> Callable[[WebDriver], bool]:
    """An expectation for checking the title of a page.

    Parameters:
    -----------
    title : str
        The expected title, which must be an exact match.

    Returns:
    -------
    boolean : True if the title matches, False otherwise.
    """

    def _predicate(driver: WebDriver):
        return driver.title == title

    return _predicate


def title_contains(title: str) -> Callable[[WebDriver], bool]:
    """An expectation for checking that the title contains a case-sensitive
    substring.

    Parameters:
    -----------
    title : str
        The fragment of title expected.

    Returns:
    -------
    boolean : True when the title matches, False otherwise.
    """

    def _predicate(driver: WebDriver):
        return title in driver.title

    return _predicate


def presence_of_element_located(locator: tuple[str, str]) -> Callable[[WebDriverOrWebElement], WebElement]:
    """An expectation for checking that an element is present on the DOM of a
    page. This does not necessarily mean that the element is visible.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.

    Returns:
    -------
    WebElement : The WebElement once it is located.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> element = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "q")))
    """

    def _predicate(driver: WebDriverOrWebElement):
        return driver.find_element(*locator)

    return _predicate


def url_contains(url: str) -> Callable[[WebDriver], bool]:
    """An expectation for checking that the current url contains a case-
    sensitive substring.

    Parameters:
    -----------
    url : str
        The fragment of url expected.

    Returns:
    -------
    boolean : True when the url matches, False otherwise.
    """

    def _predicate(driver: WebDriver):
        return url in driver.current_url

    return _predicate


def url_matches(pattern: str) -> Callable[[WebDriver], bool]:
    """An expectation for checking the current url.

    Parameters:
    -----------
    pattern : str
        The pattern to match with the current url.

    Returns:
    -------
    boolean : True when the pattern matches, False otherwise.

    Notes:
    ------
    More powerful than url_contains, as it allows for regular expressions.
    """

    def _predicate(driver: WebDriver):
        return re.search(pattern, driver.current_url) is not None

    return _predicate


def url_to_be(url: str) -> Callable[[WebDriver], bool]:
    """An expectation for checking the current url.

    Parameters:
    -----------
    url : str
        The expected url, which must be an exact match.

    Returns:
    -------
    boolean : True when the url matches, False otherwise.
    """

    def _predicate(driver: WebDriver):
        return url == driver.current_url

    return _predicate


def url_changes(url: str) -> Callable[[WebDriver], bool]:
    """An expectation for checking the current url is different than a given
    string.

    Parameters:
    -----------
    url : str
        The expected url, which must not be an exact match.

    Returns:
    -------
    boolean : True when the url does not match, False otherwise
    """

    def _predicate(driver: WebDriver):
        return url != driver.current_url

    return _predicate


def visibility_of_element_located(
    locator: tuple[str, str],
) -> Callable[[WebDriverOrWebElement], Union[Literal[False], WebElement]]:
    """An expectation for checking that an element is present on the DOM of a
    page and visible. Visibility means that the element is not only displayed
    but also has a height and width that is greater than 0.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.

    Returns:
    -------
    WebElement : The WebElement once it is located and visible.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> element = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.NAME, "q")))
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            return _element_if_visible(driver.find_element(*locator))
        except StaleElementReferenceException:
            return False

    return _predicate


def visibility_of(element: WebElement) -> Callable[[Any], Union[Literal[False], WebElement]]:
    """An expectation for checking that an element, known to be present on the
    DOM of a page, is visible.

    Parameters:
    -----------
    element : WebElement
        The WebElement to check.

    Returns:
    -------
    WebElement : The WebElement once it is visible.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> element = WebDriverWait(driver, 10).until(EC.visibility_of(driver.find_element(By.NAME, "q")))

    Notes:
    ------
    Visibility means that the element is not only displayed but also has
    a height and width that is greater than 0. element is the WebElement
    returns the (same) WebElement once it is visible
    """

    def _predicate(_):
        return _element_if_visible(element)

    return _predicate


def _element_if_visible(element: WebElement, visibility: bool = True) -> Union[Literal[False], WebElement]:
    """An expectation for checking that an element, known to be present on the
    DOM of a page, is of the expected visibility.

    Parameters:
    -----------
    element : WebElement
        The WebElement to check.
    visibility : bool
        The expected visibility of the element.

    Returns:
    -------
    WebElement : The WebElement once it is visible or not visible.
    """
    return element if element.is_displayed() == visibility else False


def presence_of_all_elements_located(locator: tuple[str, str]) -> Callable[[WebDriverOrWebElement], list[WebElement]]:
    """An expectation for checking that there is at least one element present
    on a web page.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.

    Returns:
    -------
    List[WebElement] : The list of WebElements once they are located.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> elements = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CLASS_NAME, "foo")))
    """

    def _predicate(driver: WebDriverOrWebElement):
        return driver.find_elements(*locator)

    return _predicate


def visibility_of_any_elements_located(locator: tuple[str, str]) -> Callable[[WebDriverOrWebElement], list[WebElement]]:
    """An expectation for checking that there is at least one element visible
    on a web page.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.

    Returns:
    -------
    List[WebElement] : The list of WebElements once they are located and visible.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> elements = WebDriverWait(driver, 10).until(EC.visibility_of_any_elements_located((By.CLASS_NAME, "foo")))
    """

    def _predicate(driver: WebDriverOrWebElement):
        return [element for element in driver.find_elements(*locator) if _element_if_visible(element)]

    return _predicate


def visibility_of_all_elements_located(
    locator: tuple[str, str],
) -> Callable[[WebDriverOrWebElement], Union[list[WebElement], Literal[False]]]:
    """An expectation for checking that all elements are present on the DOM of
    a page and visible. Visibility means that the elements are not only
    displayed but also has a height and width that is greater than 0.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the elements.

    Returns:
    -------
    List[WebElement] : The list of WebElements once they are located and visible.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> elements = WebDriverWait(driver, 10).until(EC.visibility_of_all_elements_located((By.CLASS_NAME, "foo")))
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            elements = driver.find_elements(*locator)
            for element in elements:
                if _element_if_visible(element, visibility=False):
                    return False
            return elements
        except StaleElementReferenceException:
            return False

    return _predicate


def text_to_be_present_in_element(locator: tuple[str, str], text_: str) -> Callable[[WebDriverOrWebElement], bool]:
    """An expectation for checking if the given text is present in the
    specified element.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.
    text_ : str
        The text to be present in the element.

    Returns:
    -------
    boolean : True when the text is present, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_text_in_element = WebDriverWait(driver, 10).until(
            EC.text_to_be_present_in_element((By.CLASS_NAME, "foo"), "bar")
        )
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            element_text = driver.find_element(*locator).text
            return text_ in element_text
        except StaleElementReferenceException:
            return False

    return _predicate


def text_to_be_present_in_element_value(
    locator: tuple[str, str], text_: str
) -> Callable[[WebDriverOrWebElement], bool]:
    """An expectation for checking if the given text is present in the
    element's value.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.
    text_ : str
        The text to be present in the element's value.

    Returns:
    -------
    boolean : True when the text is present, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_text_in_element_value = WebDriverWait(driver, 10).until(
    ...     EC.text_to_be_present_in_element_value((By.CLASS_NAME, "foo"), "bar")
    ... )
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            element_text = driver.find_element(*locator).get_attribute("value")
            if element_text is None:
                return False
            return text_ in element_text
        except StaleElementReferenceException:
            return False

    return _predicate


def text_to_be_present_in_element_attribute(
    locator: tuple[str, str], attribute_: str, text_: str
) -> Callable[[WebDriverOrWebElement], bool]:
    """An expectation for checking if the given text is present in the
    element's attribute.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.
    attribute_ : str
        The attribute to check the text in.
    text_ : str
        The text to be present in the element's attribute.

    Returns:
    -------
    boolean : True when the text is present, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_text_in_element_attribute = WebDriverWait(driver, 10).until(
    ...     EC.text_to_be_present_in_element_attribute((By.CLASS_NAME, "foo"), "bar", "baz")
    ... )
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            element_text = driver.find_element(*locator).get_attribute(attribute_)
            if element_text is None:
                return False
            return text_ in element_text
        except StaleElementReferenceException:
            return False

    return _predicate


def frame_to_be_available_and_switch_to_it(
    locator: Union[tuple[str, str], str, WebElement],
) -> Callable[[WebDriver], bool]:
    """An expectation for checking whether the given frame is available to
    switch to.

    Parameters:
    -----------
    locator : Union[Tuple[str, str], str, WebElement]
        Used to find the frame.

    Returns:
    -------
    boolean : True when the frame is available, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> WebDriverWait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it("frame_name"))

    Notes:
    ------
    If the frame is available it switches the given driver to the
    specified frame.
    """

    def _predicate(driver: WebDriver):
        try:
            if isinstance(locator, Iterable) and not isinstance(locator, str):
                driver.switch_to.frame(driver.find_element(*locator))
            else:
                driver.switch_to.frame(locator)
            return True
        except NoSuchFrameException:
            return False

    return _predicate


def invisibility_of_element_located(
    locator: Union[WebElement, tuple[str, str]],
) -> Callable[[WebDriverOrWebElement], Union[WebElement, bool]]:
    """An Expectation for checking that an element is either invisible or not
    present on the DOM.

    Parameters:
    -----------
    locator : Union[WebElement, Tuple[str, str]]
        Used to find the element.

    Returns:
    -------
    boolean : True when the element is invisible or not present, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_invisible = WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.CLASS_NAME, "foo")))

    Notes:
    ------
    - In the case of NoSuchElement, returns true because the element is not
    present in DOM. The try block checks if the element is present but is
    invisible.
    - In the case of StaleElementReference, returns true because stale element
    reference implies that element is no longer visible.
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            target = locator
            if not isinstance(target, WebElement):
                target = driver.find_element(*target)
            return _element_if_visible(target, visibility=False)
        except (NoSuchElementException, StaleElementReferenceException):
            # In the case of NoSuchElement, returns true because the element is
            # not present in DOM. The try block checks if the element is present
            # but is invisible.
            # In the case of StaleElementReference, returns true because stale
            # element reference implies that element is no longer visible.
            return True

    return _predicate


def invisibility_of_element(
    element: Union[WebElement, tuple[str, str]],
) -> Callable[[WebDriverOrWebElement], Union[WebElement, bool]]:
    """An Expectation for checking that an element is either invisible or not
    present on the DOM.

    Parameters:
    -----------
    element : Union[WebElement, Tuple[str, str]]
        Used to find the element.

    Returns:
    -------
    boolean : True when the element is invisible or not present, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_invisible_or_not_present = WebDriverWait(driver, 10).until(
    ...     EC.invisibility_of_element(driver.find_element(By.CLASS_NAME, "foo"))
    ... )
    """
    return invisibility_of_element_located(element)


def element_to_be_clickable(
    mark: Union[WebElement, tuple[str, str]],
) -> Callable[[WebDriverOrWebElement], Union[Literal[False], WebElement]]:
    """An Expectation for checking an element is visible and enabled such that
    you can click it.

    Parameters:
    -----------
    mark : Union[WebElement, Tuple[str, str]]
        Used to find the element.

    Returns:
    -------
    WebElement : The WebElement once it is located and clickable.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "foo")))
    """

    # renamed argument to 'mark', to indicate that both locator
    # and WebElement args are valid
    def _predicate(driver: WebDriverOrWebElement):
        target = mark
        if not isinstance(target, WebElement):  # if given locator instead of WebElement
            target = driver.find_element(*target)  # grab element at locator
        element = visibility_of(target)(driver)
        if element and element.is_enabled():
            return element
        return False

    return _predicate


def staleness_of(element: WebElement) -> Callable[[Any], bool]:
    """Wait until an element is no longer attached to the DOM.

    Parameters:
    -----------
    element : WebElement
        The element to wait for.

    Returns:
    -------
    boolean : False if the element is still attached to the DOM, true otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_element_stale = WebDriverWait(driver, 10).until(EC.staleness_of(driver.find_element(By.CLASS_NAME, "foo")))
    """

    def _predicate(_):
        try:
            # Calling any method forces a staleness check
            element.is_enabled()
            return False
        except StaleElementReferenceException:
            return True

    return _predicate


def element_to_be_selected(element: WebElement) -> Callable[[Any], bool]:
    """An expectation for checking the selection is selected.

    Parameters:
    -----------
    element : WebElement
        The WebElement to check.

    Returns:
    -------
    boolean : True if the element is selected, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_selected = WebDriverWait(driver, 10).until(EC.element_to_be_selected(driver.find_element(
            By.CLASS_NAME, "foo"))
        )
    """

    def _predicate(_):
        return element.is_selected()

    return _predicate


def element_located_to_be_selected(locator: tuple[str, str]) -> Callable[[WebDriverOrWebElement], bool]:
    """An expectation for the element to be located is selected.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.

    Returns:
    -------
    boolean : True if the element is selected, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_selected = WebDriverWait(driver, 10).until(EC.element_located_to_be_selected((By.CLASS_NAME, "foo")))
    """

    def _predicate(driver: WebDriverOrWebElement):
        return driver.find_element(*locator).is_selected()

    return _predicate


def element_selection_state_to_be(element: WebElement, is_selected: bool) -> Callable[[Any], bool]:
    """An expectation for checking if the given element is selected.

    Parameters:
    -----------
    element : WebElement
        The WebElement to check.
    is_selected : bool

    Returns:
    -------
    boolean : True if the element's selection state is the same as is_selected

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_selected = WebDriverWait(driver, 10).until(
    ...     EC.element_selection_state_to_be(driver.find_element(By.CLASS_NAME, "foo"), True)
    ... )
    """

    def _predicate(_):
        return element.is_selected() == is_selected

    return _predicate


def element_located_selection_state_to_be(
    locator: tuple[str, str], is_selected: bool
) -> Callable[[WebDriverOrWebElement], bool]:
    """An expectation to locate an element and check if the selection state
    specified is in that state.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.
    is_selected : bool

    Returns:
    -------
    boolean : True if the element's selection state is the same as is_selected

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_selected = WebDriverWait(driver, 10).until(EC.element_located_selection_state_to_be(
            (By.CLASS_NAME, "foo"), True)
        )
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            element = driver.find_element(*locator)
            return element.is_selected() == is_selected
        except StaleElementReferenceException:
            return False

    return _predicate


def number_of_windows_to_be(num_windows: int) -> Callable[[WebDriver], bool]:
    """An expectation for the number of windows to be a certain value.

    Parameters:
    -----------
    num_windows : int
        The expected number of windows.

    Returns:
    -------
    boolean : True when the number of windows matches, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_number_of_windows = WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))
    """

    def _predicate(driver: WebDriver):
        return len(driver.window_handles) == num_windows

    return _predicate


def new_window_is_opened(current_handles: list[str]) -> Callable[[WebDriver], bool]:
    """An expectation that a new window will be opened and have the number of
    windows handles increase.

    Parameters:
    -----------
    current_handles : List[str]
        The current window handles.

    Returns:
    -------
    boolean : True when a new window is opened, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.support.ui import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_new_window_opened = WebDriverWait(driver, 10).until(EC.new_window_is_opened(driver.window_handles))
    """

    def _predicate(driver: WebDriver):
        return len(driver.window_handles) > len(current_handles)

    return _predicate


def alert_is_present() -> Callable[[WebDriver], Union[Alert, Literal[False]]]:
    """An expectation for checking if an alert is currently present and
    switching to it.

    Returns:
    -------
    Alert : The Alert once it is located.

    Example:
    --------
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> alert = WebDriverWait(driver, 10).until(EC.alert_is_present())

    Notes:
    ------
    If the alert is present it switches the given driver to it.
    """

    def _predicate(driver: WebDriver):
        try:
            return driver.switch_to.alert
        except NoAlertPresentException:
            return False

    return _predicate


def element_attribute_to_include(locator: tuple[str, str], attribute_: str) -> Callable[[WebDriverOrWebElement], bool]:
    """An expectation for checking if the given attribute is included in the
    specified element.

    Parameters:
    -----------
    locator : Tuple[str, str]
        Used to find the element.
    attribute_ : str
        The attribute to check.

    Returns:
    -------
    boolean : True when the attribute is included, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> is_attribute_in_element = WebDriverWait(driver, 10).until(
    ...     EC.element_attribute_to_include((By.CLASS_NAME, "foo"), "bar")
    ... )
    """

    def _predicate(driver: WebDriverOrWebElement):
        try:
            element_attribute = driver.find_element(*locator).get_attribute(attribute_)
            return element_attribute is not None
        except StaleElementReferenceException:
            return False

    return _predicate


def any_of(*expected_conditions: Callable[[D], T]) -> Callable[[D], Union[Literal[False], T]]:
    """An expectation that any of multiple expected conditions is true.

    Parameters:
    -----------
    expected_conditions : Callable[[D], T]
        The list of expected conditions to check.

    Returns:
    -------
    T : The result of the first matching condition, or False if none do.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> element = WebDriverWait(driver, 10).until(
    ... EC.any_of(EC.presence_of_element_located((By.NAME, "q"),
    ... EC.visibility_of_element_located((By.NAME, "q"))))

    Notes:
    ------
    Equivalent to a logical 'OR'. Returns results of the first matching
    condition, or False if none do.
    """

    def any_of_condition(driver: D):
        for expected_condition in expected_conditions:
            try:
                result = expected_condition(driver)
                if result:
                    return result
            except WebDriverException:
                pass
        return False

    return any_of_condition


def all_of(
    *expected_conditions: Callable[[D], Union[T, Literal[False]]],
) -> Callable[[D], Union[list[T], Literal[False]]]:
    """An expectation that all of multiple expected conditions is true.

    Parameters:
    -----------
    expected_conditions : Callable[[D], Union[T, Literal[False]]]
        The list of expected conditions to check.

    Returns:
    -------
    List[T] : The results of all the matching conditions, or False if any do not.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> elements = WebDriverWait(driver, 10).until(
    ... EC.all_of(EC.presence_of_element_located((By.NAME, "q"),
    ... EC.visibility_of_element_located((By.NAME, "q"))))

    Notes:
    ------
    Equivalent to a logical 'AND'.
    Returns: When any ExpectedCondition is not met: False.
    When all ExpectedConditions are met: A List with each ExpectedCondition's return value.
    """

    def all_of_condition(driver: D):
        results: list[T] = []
        for expected_condition in expected_conditions:
            try:
                result = expected_condition(driver)
                if not result:
                    return False
                results.append(result)
            except WebDriverException:
                return False
        return results

    return all_of_condition


def none_of(*expected_conditions: Callable[[D], Any]) -> Callable[[D], bool]:
    """An expectation that none of 1 or multiple expected conditions is true.

    Parameters:
    -----------
    expected_conditions : Callable[[D], Any]
        The list of expected conditions to check.

    Returns:
    -------
    boolean : True if none of the conditions are true, False otherwise.

    Example:
    --------
    >>> from selenium.webdriver.common.by import By
    >>> from selenium.webdriver.support.ui import WebDriverWait
    >>> from selenium.webdriver.support import expected_conditions as EC
    >>> element = WebDriverWait(driver, 10).until(
    ... EC.none_of(EC.presence_of_element_located((By.NAME, "q"),
    ... EC.visibility_of_element_located((By.NAME, "q"))))

    Notes:
    ------
    Equivalent to a logical 'NOT-OR'. Returns a Boolean
    """

    def none_of_condition(driver: D):
        for expected_condition in expected_conditions:
            try:
                result = expected_condition(driver)
                if result:
                    return False
            except WebDriverException:
                pass
        return True

    return none_of_condition
