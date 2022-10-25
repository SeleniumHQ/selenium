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

from selenium.webdriver.common.print_page_options import PrintOptions


@pytest.fixture
def print_options():
    return PrintOptions()


def test_set_orientation(print_options):
    print_options.orientation = "portrait"
    assert print_options.orientation == "portrait"


def test_raises_exception_if_orientation_is_invalid(print_options):
    with pytest.raises(ValueError):
        print_options.orientation = "foobar"


def test_set_scale(print_options):
    print_options.scale = 1
    assert print_options.scale == 1


def test_raises_exception_if_scale_is_outside_range(print_options):
    with pytest.raises(ValueError):
        print_options.scale = 3


def test_raises_exception_if_scale_is_not_an_integer(print_options):
    with pytest.raises(ValueError):
        print_options.scale = "1"


def test_set_background(print_options):
    print_options.background = True
    assert print_options.background is True


def test_unset_value_to_be_none(print_options):
    assert print_options.page_width is None


def test_set_width(print_options):
    print_options.page_width = 3
    assert print_options.page_width == 3


def test_raises_exception_if_set_invalid_width(print_options):
    with pytest.raises(ValueError):
        print_options.page_width = -1


def test_raises_exception_if_set_with_not_int(print_options):
    with pytest.raises(ValueError):
        print_options.page_width = "2"


def test_set_height(print_options):
    print_options.page_height = 2
    assert print_options.page_height == 2


def test_set_shrink_to_fit(print_options):
    print_options.shrink_to_fit = True
    assert print_options.shrink_to_fit is True


def test_raises_exception_if_set_shrink_to_fit_non_bool(print_options):
    with pytest.raises(ValueError):
        print_options.shrink_to_fit = "True"


def test_set_page_ranges(print_options):
    print_options.page_ranges = ["1-2"]
    assert print_options.page_ranges == ["1-2"]


def test_raises_exception_if_page_ranges_not_list(print_options):
    with pytest.raises(ValueError):
        print_options.page_ranges = "foobar"


def test_margin_height(print_options):
    print_options.margin_top = 2
    assert print_options.margin_top == 2


def test_raises_exception_if_margin_is_invalid(print_options):
    with pytest.raises(ValueError):
        print_options.margin_top = -1

    with pytest.raises(ValueError):
        print_options.margin_top = "2"
