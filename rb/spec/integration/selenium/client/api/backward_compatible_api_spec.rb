# encoding: utf-8
#
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

require File.expand_path(__FILE__ + '/../../spec_helper')

describe "Backward Compatible API" do
  it "provides legacy driver methods" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"

    expect(page.get_title).to eql("Click Page 1")
    expect(page.get_text("link").index("Click here for next page")).not_to be_nil

    links = page.get_all_links
    expect(links.length).to be > 3
    expect(links[3]).to eql("linkToAnchorOnThisPage")

    page.click "link"
    page.wait_for_page_to_load 5000
    expect(page.get_location).to match(%r"/selenium-server/org/openqa/selenium/tests/html/test_click_page2.html")

    page.click "previousPage"
    page.wait_for_page_to_load 5000
    expect(page.get_location).to match(%r"/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html")
  end
end
