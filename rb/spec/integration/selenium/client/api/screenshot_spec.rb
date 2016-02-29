# encoding: binary

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

require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Screenshot" do
  it "can capture html for current page" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
    expect(page.get_html_source).to match(/<head>/)
  end

  it "captures PNG screenshot OS viewport as a file on Selenium RC local filesystem" do
    tempfile = File.join(Dir.tmpdir, "selenium_screenshot.png")

    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
    page.capture_screenshot tempfile

    expect(File.exists?(tempfile)).to be true
    File.open(tempfile, "rb") do |io|
      magic = io.read(4)
      expect(magic).to eq("\211PNG")
    end
  end

  it "captures PNG screenshot OS viewport as a Base64 encoded PNG image" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
    encodedImage = page.capture_screenshot_to_string
    pngImage = Base64.decode64(encodedImage)

    expect(pngImage).to match(/^\211PNG/n)
  end
end
