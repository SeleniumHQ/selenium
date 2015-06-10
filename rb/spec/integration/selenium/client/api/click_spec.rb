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

describe "Click Instrumentation" do
  it "clicks" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
    page.text_content("link").should eql("Click here for next page")

    page.click "link", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.title.should eql("Click Page 1")

    page.click "linkWithEnclosedImage", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.click "enclosedImage", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.click "extraEnclosedImage", :wait_for => :page
    page.title.should eql("Click Page Target")

    page.click "previousPage", :wait_for => :page
    page.click "linkToAnchorOnThisPage"
    page.title.should eql("Click Page 1")

    page.click "linkWithOnclickReturnsFalse"
    page.title.should eql("Click Page 1")
  end

  it "double clicks" do
    page.open "http://localhost:4444/selenium-server/org/openqa/selenium/tests/html/test_click_page1.html"
    page.double_click "doubleClickable"

    page.get_alert.should eql("double clicked!")
  end
end
