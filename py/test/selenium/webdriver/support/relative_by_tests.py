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

from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.relative_locator import locate_with, with_tag_name


def test_should_be_able_to_find_first_one(driver, pages):
    pages.load("relative_locators.html")
    lowest = driver.find_element(By.ID, "below")

    el = driver.find_element(with_tag_name("p").above(lowest))

    assert el.get_attribute("id") == "mid"


def test_should_be_able_to_find_first_one_by_locator(driver, pages):
    pages.load("relative_locators.html")

    el = driver.find_element(with_tag_name("p").above({By.ID: "below"}))

    assert el.get_attribute("id") == "mid"


def test_should_be_able_to_find_elements_above_another(driver, pages):
    pages.load("relative_locators.html")
    lowest = driver.find_element(By.ID, "below")

    elements = driver.find_elements(with_tag_name("p").above(lowest))

    ids = [el.get_attribute("id") for el in elements]
    assert "above" in ids
    assert "mid" in ids


def test_should_be_able_to_find_elements_above_another_by_locator(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("p").above({By.ID: "below"}))

    ids = [el.get_attribute("id") for el in elements]
    assert "above" in ids
    assert "mid" in ids


def test_should_be_able_to_combine_filters(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        with_tag_name("td").above(driver.find_element(By.ID, "center")).to_right_of(driver.find_element(By.ID, "top"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "topRight" in ids


def test_should_be_able_to_combine_filters_by_locator(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").above({By.ID: "center"}).to_right_of({By.ID: "top"}))

    ids = [el.get_attribute("id") for el in elements]
    assert "topRight" in ids


def test_should_be_able_to_use_css_selectors(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        locate_with(By.CSS_SELECTOR, "td")
        .above(driver.find_element(By.ID, "center"))
        .to_right_of(driver.find_element(By.ID, "top"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "topRight" in ids


def test_should_be_able_to_use_css_selectors_by_locator(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        locate_with(By.CSS_SELECTOR, "td").above({By.ID: "center"}).to_right_of({By.ID: "top"})
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "topRight" in ids


def test_should_be_able_to_use_xpath(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        locate_with(By.XPATH, "//td[1]")
        .below(driver.find_element(By.ID, "top"))
        .above(driver.find_element(By.ID, "bottomLeft"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "left" in ids


def test_should_be_able_to_use_xpath_by_locator(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(locate_with(By.XPATH, "//td[1]").below({By.ID: "top"}).above({By.ID: "bottomLeft"}))

    ids = [el.get_attribute("id") for el in elements]
    assert "left" in ids


def test_should_be_able_to_combine_straight_filters(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        with_tag_name("td")
        .straight_below(driver.find_element(By.ID, "topRight"))
        .straight_right_of(driver.find_element(By.ID, "bottomLeft"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 1
    assert "bottomRight" in ids


def test_no_such_element_is_raised_rather_than_index_error(driver, pages):
    pages.load("relative_locators.html")
    with pytest.raises(NoSuchElementException) as exc:
        anchor = driver.find_element(By.ID, "top")
        driver.find_element(locate_with(By.ID, "nonexistentid").above(anchor))
    assert "Cannot locate relative element with: {'id': 'nonexistentid'}" in exc.value.msg


def test_no_such_element_is_raised_rather_than_index_error_by_locator(driver, pages):
    pages.load("relative_locators.html")
    with pytest.raises(NoSuchElementException) as exc:
        driver.find_element(locate_with(By.ID, "nonexistentid").above({By.ID: "top"}))
    assert "Cannot locate relative element with: {'id': 'nonexistentid'}" in exc.value.msg


def test_near_locator_should_find_near_elements(driver, pages):
    pages.load("relative_locators.html")
    rect = driver.find_element(By.ID, "rect1")

    el = driver.find_element(locate_with(By.ID, "rect2").near(rect))

    assert el.get_attribute("id") == "rect2"


def test_near_locator_should_find_near_elements_by_locator(driver, pages):
    pages.load("relative_locators.html")

    el = driver.find_element(locate_with(By.ID, "rect2").near({By.ID: "rect1"}))

    assert el.get_attribute("id") == "rect2"


def test_near_locator_should_not_find_far_elements(driver, pages):
    pages.load("relative_locators.html")
    rect = driver.find_element(By.ID, "rect2")

    with pytest.raises(NoSuchElementException) as exc:
        driver.find_element(locate_with(By.ID, "rect4").near(rect))

    assert "Cannot locate relative element with: {'id': 'rect4'}" in exc.value.msg


def test_near_locator_should_not_find_far_elements_by_locator(driver, pages):
    pages.load("relative_locators.html")

    with pytest.raises(NoSuchElementException) as exc:
        driver.find_element(locate_with(By.ID, "rect4").near({By.ID: "rect2"}))

    assert "Cannot locate relative element with: {'id': 'rect4'}" in exc.value.msg


def test_near_locator_should_find_far_elements(driver, pages):
    pages.load("relative_locators.html")
    rect = driver.find_element(By.ID, "rect2")

    el = driver.find_element(locate_with(By.ID, "rect4").near(rect, 100))

    assert el.get_attribute("id") == "rect4"


def test_near_locator_should_find_far_elements_by_locator(driver, pages):
    pages.load("relative_locators.html")

    el = driver.find_element(locate_with(By.ID, "rect4").near({By.ID: "rect2"}, 100))

    assert el.get_attribute("id") == "rect4"


def test_should_find_elements_above_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").above({By.ID: "center"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 3
    assert "top" in ids
    assert "topLeft" in ids
    assert "topRight" in ids


def test_should_find_elements_below_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").below({By.ID: "center"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 3
    assert "bottom" in ids
    assert "bottomLeft" in ids
    assert "bottomRight" in ids


def test_should_find_elements_left_of_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").to_left_of({By.ID: "center"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 3
    assert "left" in ids
    assert "topLeft" in ids
    assert "bottomLeft" in ids


def test_should_find_elements_right_of_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").to_right_of({By.ID: "center"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 3
    assert "right" in ids
    assert "topRight" in ids
    assert "bottomRight" in ids


def test_should_find_elements_straight_above_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").straight_above({By.ID: "bottom"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 2
    assert "top" in ids
    assert "center" in ids


def test_should_find_elements_straight_below_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").straight_below({By.ID: "top"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 2
    assert "bottom" in ids
    assert "center" in ids


def test_should_find_elements_straight_left_of_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").straight_left_of({By.ID: "right"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 2
    assert "left" in ids
    assert "center" in ids


def test_should_find_elements_straight_right_of_another(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").straight_right_of({By.ID: "left"}))

    ids = [el.get_attribute("id") for el in elements]
    assert len(ids) == 2
    assert "right" in ids
    assert "center" in ids
