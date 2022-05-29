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


def test_same_element_looked_up_different_ways_should_be_equal(driver, pages):
    pages.load("simpleTest.html")
    body = driver.find_element(By.TAG_NAME, "body")
    xbody = driver.find_elements(By.XPATH, "//body")[0]

    assert body == xbody


def test_different_elements_are_not_equal(driver, pages):
    pages.load("simpleTest.html")
    body = driver.find_element(By.TAG_NAME, "body")
    div = driver.find_element(By.TAG_NAME, "div")

    assert body != div


def test_same_elements_found_different_ways_should_not_be_duplicated_in_aset(driver, pages):
    pages.load("simpleTest.html")
    body = driver.find_element(By.TAG_NAME, "body")
    xbody = driver.find_elements(By.XPATH, "//body")
    s = set(xbody)
    s.add(body)
    assert 1 == len(s)
