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
from selenium.webdriver.support.relative_locator import locate_with
from selenium.webdriver.support.relative_locator import with_tag_name


def test_should_be_able_to_find_first_one(driver, pages):
    pages.load("relative_locators.html")
    lowest = driver.find_element(By.ID, "below")

    el = driver.find_element(with_tag_name("p").above(lowest))

    assert el.get_attribute("id") == "mid"


def test_should_be_able_to_find_elements_above_another(driver, pages):
    pages.load("relative_locators.html")
    lowest = driver.find_element(By.ID, "below")

    elements = driver.find_elements(with_tag_name("p").above(lowest))

    ids = [el.get_attribute("id") for el in elements]
    assert "above" in ids
    assert "mid" in ids


def test_should_be_able_to_combine_filters(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        with_tag_name("td")
        .above(driver.find_element(By.ID, "center"))
        .to_right_of(driver.find_element(By.ID, "second"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "third" in ids


def test_should_be_able_to_use_css_selectors(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        locate_with(By.CSS_SELECTOR, "td")
        .above(driver.find_element(By.ID, "center"))
        .to_right_of(driver.find_element(By.ID, "second"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "third" in ids


def test_should_be_able_to_use_xpath(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(
        locate_with(By.XPATH, "//td[1]")
        .below(driver.find_element(By.ID, "second"))
        .above(driver.find_element(By.ID, "seventh"))
    )

    ids = [el.get_attribute("id") for el in elements]
    assert "fourth" in ids


def test_no_such_element_is_raised_rather_than_index_error(driver, pages):
    pages.load("relative_locators.html")
    with pytest.raises(NoSuchElementException) as exc:
        anchor = driver.find_element(By.ID, "second")
        driver.find_element(locate_with(By.ID, "nonexistentid").above(anchor))
    assert "Cannot locate relative element with: {'id': 'nonexistentid'}" in exc.value.msg


def test_near_locator_should_find_near_elements(driver, pages):
    pages.load("relative_locators.html")
    rect1 = driver.find_element(By.ID, "rect1")

    el = driver.find_element(locate_with(By.ID, "rect2").near(rect1))

    assert el.get_attribute("id") == "rect2"


def test_near_locator_should_not_find_far_elements(driver, pages):
    pages.load("relative_locators.html")
    rect3 = driver.find_element(By.ID, "rect3")

    with pytest.raises(NoSuchElementException) as exc:
        driver.find_element(locate_with(By.ID, "rect4").near(rect3))

    assert "Cannot locate relative element with: {'id': 'rect4'}" in exc.value.msg
