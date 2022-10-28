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
from selenium.common.exceptions import UnexpectedTagNameException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

disabledSelect = {"name": "no-select", "values": ["Foo"]}
disabledSingleSelect = {"name": "single_disabled", "values": ["Enabled", "Disabled"]}
disabledMultiSelect = {"name": "multi_disabled", "values": ["Enabled", "Disabled"]}
singleSelectValues1 = {
    "name": "selectomatic",
    "values": ["One", "Two", "Four", "Still learning how to count, apparently"],
}
singleSelectValues2 = {"name": "redirect", "values": ["One", "Two"]}
singleSelectValuesWithSpaces = {
    "name": "select_with_spaces",
    "values": ["One", "Two", "Four", "Still learning how to count, apparently"],
}
multiSelectValues1 = {"name": "multi", "values": ["Eggs", "Ham", "Sausages", "Onion gravy"]}
multiSelectValues2 = {"name": "select_empty_multiple", "values": ["select_1", "select_2", "select_3", "select_4"]}


def test_select_by_index_single(driver, pages):
    pages.load("formPage.html")

    for select in [singleSelectValues1]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        for x in range(len(select["values"])):
            sel.select_by_index(x)
            assert sel.first_selected_option.text == select["values"][x]


def test_raises_exception_select_by_index_single_disabled(driver, pages):
    pages.load("formPage.html")
    sel = Select(driver.find_element(By.NAME, disabledSingleSelect["name"]))
    with pytest.raises(NotImplementedError):
        sel.select_by_index(1)


def test_select_by_value_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        for x in range(len(select["values"])):
            sel.select_by_value(select["values"][x].lower())
            assert sel.first_selected_option.text == select["values"][x]


def test_raises_exception_select_by_value_single_disabled(driver, pages):
    pages.load("formPage.html")
    sel = Select(driver.find_element(By.NAME, disabledSingleSelect["name"]))
    with pytest.raises(NotImplementedError):
        sel.select_by_value(disabledSingleSelect["values"][1].lower())


def test_select_by_visible_text_single(driver, pages):
    pages.load("formPage.html")

    for select in [singleSelectValues1]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        for x in range(len(select["values"])):
            print(select["values"][x])
            sel.select_by_visible_text(select["values"][x])
            assert sel.first_selected_option.text == select["values"][x]


def test_raises_exception_select_by_text_single_disabled(driver, pages):
    pages.load("formPage.html")
    sel = Select(driver.find_element(By.NAME, disabledSingleSelect["name"]))
    with pytest.raises(NotImplementedError):
        sel.select_by_visible_text(disabledSingleSelect["values"][1])


def test_select_by_index_multiple(driver, pages):
    pages.load("formPage.html")

    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        for x in range(len(select["values"])):
            sel.select_by_index(x)
            selected = sel.all_selected_options
            assert len(selected) == x + 1
            for j in range(len(selected)):
                assert selected[j].text == select["values"][j]


def test_raises_exception_select_by_index_multiple_disabled(driver, pages):
    pages.load("formPage.html")

    sel = Select(driver.find_element(By.NAME, disabledMultiSelect["name"]))
    with pytest.raises(NotImplementedError):
        sel.select_by_index(1)


def test_select_by_value_multiple(driver, pages):
    pages.load("formPage.html")

    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        for x in range(len(select["values"])):
            sel.select_by_value(select["values"][x].lower())
            selected = sel.all_selected_options
            assert len(selected) == x + 1
            for j in range(len(selected)):
                assert selected[j].text == select["values"][j]


def test_raises_exception_select_by_value_multiple_disabled(driver, pages):
    pages.load("formPage.html")

    sel = Select(driver.find_element(By.NAME, disabledMultiSelect["name"]))
    with pytest.raises(NotImplementedError):
        sel.select_by_value(disabledMultiSelect["values"][1].lower())


def test_select_by_visible_text_multiple(driver, pages):
    pages.load("formPage.html")

    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        for x in range(len(select["values"])):
            sel.select_by_visible_text(select["values"][x])
            selected = sel.all_selected_options
            assert len(selected) == x + 1
            for j in range(len(selected)):
                assert selected[j].text == select["values"][j]


def test_raises_exception_select_by_text_multiple_disabled(driver, pages):
    pages.load("formPage.html")

    sel = Select(driver.find_element(By.NAME, disabledMultiSelect["name"]))
    with pytest.raises(NotImplementedError):
        sel.select_by_visible_text(disabledMultiSelect["values"][1])


def test_deselect_all_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select["name"])).deselect_all()


def test_deselect_all_multiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        assert len(sel.all_selected_options) == 0


def test_deselect_by_index_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select["name"])).deselect_by_index(0)


def test_deselect_by_value_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select["name"])).deselect_by_value(select["values"][0].lower())


def test_deselect_by_visible_text_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select["name"])).deselect_by_visible_text(select["values"][0])


def test_deselect_by_index_multiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        sel.select_by_index(0)
        sel.select_by_index(1)
        sel.select_by_index(2)
        sel.select_by_index(3)
        sel.deselect_by_index(1)
        sel.deselect_by_index(3)
        selected = sel.all_selected_options
        assert len(selected) == 2
        assert selected[0].text == select["values"][0]
        assert selected[1].text == select["values"][2]


def test_deselect_by_value_multiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        sel.select_by_index(0)
        sel.select_by_index(1)
        sel.select_by_index(2)
        sel.select_by_index(3)
        sel.deselect_by_value(select["values"][1].lower())
        sel.deselect_by_value(select["values"][3].lower())
        selected = sel.all_selected_options
        assert len(selected) == 2
        assert selected[0].text == select["values"][0]
        assert selected[1].text == select["values"][2]


def test_deselect_by_visible_text_multiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select["name"]))
        sel.deselect_all()
        sel.select_by_index(0)
        sel.select_by_index(1)
        sel.select_by_index(2)
        sel.select_by_index(3)
        sel.deselect_by_visible_text(select["values"][1])
        sel.deselect_by_visible_text(select["values"][3])
        selected = sel.all_selected_options
        assert len(selected) == 2
        assert selected[0].text == select["values"][0]
        assert selected[1].text == select["values"][2]


def test_get_options(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2, multiSelectValues1, multiSelectValues2]:
        opts = Select(driver.find_element(By.NAME, select["name"])).options
        assert len(opts) == len(select["values"])
        for i in range(len(opts)):
            assert opts[i].text == select["values"][i]


def test_get_all_selected_options_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2, disabledSelect]:
        opts = Select(driver.find_element(By.NAME, select["name"])).all_selected_options
        assert len(opts) == 1
        assert opts[0].text == select["values"][0]


def test_get_all_selected_options_multiple(driver, pages):
    pages.load("formPage.html")
    opts = Select(driver.find_element(By.NAME, multiSelectValues1["name"])).all_selected_options
    assert len(opts) == 2
    assert opts[0].text, multiSelectValues1["values"][0]
    assert opts[1].text, multiSelectValues1["values"][2]
    opts = Select(driver.find_element(By.NAME, multiSelectValues2["name"])).all_selected_options
    assert len(opts) == 0


def test_get_first_selected_option_single(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        opt = Select(driver.find_element(By.NAME, select["name"])).first_selected_option
        assert opt.text == select["values"][0]


def test_get_first_selected_option_multiple(driver, pages):
    pages.load("formPage.html")
    opt = Select(driver.find_element(By.NAME, multiSelectValues1["name"])).first_selected_option
    assert opt.text == multiSelectValues1["values"][0]
    opt = Select(driver.find_element(By.NAME, multiSelectValues2["name"])).all_selected_options
    assert len(opt) == 0


def test_raises_exception_for_invalid_tag_name(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(UnexpectedTagNameException):
        Select(driver.find_element(By.TAG_NAME, "div"))


def test_deselect_by_index_non_existent(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        with pytest.raises(NoSuchElementException):
            Select(driver.find_element(By.NAME, select["name"])).deselect_by_index(10)


def test_deselect_by_value_non_existent(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        with pytest.raises(NoSuchElementException):
            Select(driver.find_element(By.NAME, select["name"])).deselect_by_value("not there")


def test_deselect_by_text_non_existent(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        with pytest.raises(NoSuchElementException):
            Select(driver.find_element(By.NAME, select["name"])).deselect_by_visible_text("not there")
