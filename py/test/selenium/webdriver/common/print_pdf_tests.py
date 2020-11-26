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

from selenium.webdriver import Chrome
from selenium.webdriver import Firefox
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.options import PrintOptions

start_index = 0
end_index = 5
pdf_magic_number = 'JVBER'
options = Options()
options.add_argument("--headless") # chrome needs to be headless, print works only in headless

chrome_driver = Chrome(options=options)
firefox_driver = Firefox()

def test_pdf_with_2_pages(pages):
    chrome_print_options = PrintOptions()
    firefox_print_options = PrintOptions()

    chrome_print_options.set_option('pageRanges', ['1-2'])
    firefox_print_options.set_option('pageRanges', ['1-2'])

    chrome_driver.get(pages.url("printPage.html"))
    firefox_driver.get(pages.url("printPage.html"))

    chrome_base64code = chrome_driver.print_page(chrome_print_options)
    firefox_base64code = firefox_driver.print_page(firefox_print_options)

    assert chrome_base64code[start_index : end_index] == pdf_magic_number
    assert firefox_base64code[start_index : end_index] == pdf_magic_number

def test_pdf_with_all_pages(pages):
    chrome_driver.get(pages.url("printPage.html"))
    firefox_driver.get(pages.url("printPage.html"))

    chrome_base64code = chrome_driver.print_page()
    firefox_base64code = firefox_driver.print_page()

    assert chrome_base64code[start_index : end_index] == pdf_magic_number
    assert firefox_base64code[start_index : end_index] == pdf_magic_number

def test_valid_params(pages):
    chrome_print_options = PrintOptions()
    firefox_print_options = PrintOptions()

    chrome_print_options.set_option('pageRanges', ['1-2'])
    chrome_print_options.set_option('orientation', 'landscape')
    chrome_print_options.set_option('width', 30)

    firefox_print_options.set_option('pageRanges', ['1-2'])
    firefox_print_options.set_option('orientation', 'landscape')
    firefox_print_options.set_option('width', 30)
    
    chrome_driver.get(pages.url("printPage.html"))
    firefox_driver.get(pages.url("printPage.html"))

    chrome_base64code = chrome_driver.print_page(chrome_print_options)
    firefox_base64code = firefox_driver.print_page(firefox_print_options)

    assert chrome_base64code[start_index : end_index] == pdf_magic_number
    assert firefox_base64code[start_index : end_index] == pdf_magic_number
