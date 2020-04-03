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

from selenium.webdriver.common.by import By
from selenium.webdriver.support.relative_locator import with_tag_name


def test_should_be_able_to_find_elements_above_another(driver, pages):
    pages.load("relative_locators.html")
    lowest = driver.find_element(By.ID, "below")

    elements = driver.find_elements(with_tag_name("p").above(lowest))

    ids = [el.get_attribute('id') for el in elements]
    assert "above" in ids
    assert "mid" in ids


def test_should_be_able_to_combine_filters(driver, pages):
    pages.load("relative_locators.html")

    elements = driver.find_elements(with_tag_name("td").above(driver.find_element(By.ID, "center"))
                                    .to_right_of(driver.find_element(By.ID, "second")))

    ids = [el.get_attribute('id') for el in elements]
    assert "third" in ids
