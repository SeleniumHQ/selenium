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

describe "#wait_for_element" do
  it "does not block when element is present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_element "element-present-demo"
    page.wait_for_element "id=element-present-demo"
    page.wait_for_element "css=#element-present-demo"
  end

  it "times out when element is not present" do
    page.open "http://localhost:4567/jquery.html"

    should_timeout do
      page.wait_for_element "new-element", :timeout_in_seconds => 2
    end

    should_timeout do
      page.wait_for_element "does-not-exists", :timeout_in_seconds => 2
    end
  end

  it "detects dynamics changes in the DOM" do
    page.open "http://localhost:4567/jquery.html"
    page.click "create-element-button", :wait_for => :element, :element => 'new-element'
    page.click "delete-element-button", :wait_for => :no_element, :element => 'new-element'

    should_timeout do
      page.wait_for_element "new-element", :timeout_in_seconds => 2
    end
  end

  it "can handle quotes and double quotes in its locator definition" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_element "//div[@id='element-present-demo']"
    page.wait_for_no_element "//div[@id='new-element']"
    page.click "create-element-button", :wait_for => :element, :element => "//div[@id='new-element']"
  end
end

describe "#wait_for_no_element" do
  it "does not block when element is not present" do
    page.open "http://localhost:4567/jquery.html"
    page.wait_for_no_element "new-element"
    page.wait_for_no_element "does-not-exists"
  end

  it "times out when element is present" do
    page.open "http://localhost:4567/jquery.html"

    should_timeout do
      page.wait_for_no_element "element-present-demo", :timeout_in_seconds => 2
    end
  end
end

