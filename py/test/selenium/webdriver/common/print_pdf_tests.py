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

from selenium.webdriver.common.print_page_options import PrintOptions

START_INDEX = 0
END_INDEX = 5
PDF_MAGIC_NUMBER = "JVBER"


def test_pdf_with_2_pages(driver, pages):
    print_options = PrintOptions()
    print_options.page_ranges = ["1-2"]

    pages.load("printPage.html")

    base64code = driver.print_page(print_options)

    assert base64code[START_INDEX:END_INDEX] == PDF_MAGIC_NUMBER


def test_pdf_with_all_pages(driver, pages):
    pages.load("printPage.html")
    base64code = driver.print_page()

    assert base64code[START_INDEX:END_INDEX] == PDF_MAGIC_NUMBER


def test_valid_params(driver, pages):
    print_options = PrintOptions()

    print_options.page_ranges = ["1-2"]
    print_options.orientation = "landscape"
    print_options.width = 30

    pages.load("printPage.html")
    base64code = driver.print_page(print_options)

    assert base64code[START_INDEX:END_INDEX] == PDF_MAGIC_NUMBER


def test_session_id_is_not_preserved_after_page_is_printed(driver, pages):
    print_options = PrintOptions()
    print_options.margin_bottom = print_options.margin_top = print_options.margin_left = print_options.margin_right = 0
    assert "sessionId" not in print_options.to_dict()
    pages.load("printPage.html")
    driver.print_page(print_options=print_options)
    assert "sessionId" not in print_options.to_dict()
