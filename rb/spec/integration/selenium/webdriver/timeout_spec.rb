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

require File.expand_path("../spec_helper", __FILE__)

describe "Timeouts" do

  context "implicit waits" do
    before do
      driver.manage.timeouts.implicit_wait = 0
      driver.navigate.to url_for("dynamic.html")
    end

    after { driver.manage.timeouts.implicit_wait = 0 }

    it "should implicitly wait for a single element" do
      driver.manage.timeouts.implicit_wait = 6

      driver.find_element(:id => 'adder').click
      driver.find_element(:id => 'box0')
    end

    it "should still fail to find an element with implicit waits enabled" do
      driver.manage.timeouts.implicit_wait = 0.5
      lambda { driver.find_element(:id => "box0") }.should raise_error(WebDriver::Error::NoSuchElementError)
    end

    it "should return after first attempt to find one after disabling implicit waits" do
      driver.manage.timeouts.implicit_wait = 3
      driver.manage.timeouts.implicit_wait = 0

      lambda { driver.find_element(:id => "box0") }.should raise_error(WebDriver::Error::NoSuchElementError)
    end

    it "should implicitly wait until at least one element is found when searching for many" do
      add = driver.find_element(:id => "adder")

      driver.manage.timeouts.implicit_wait = 6
      add.click
      add.click

      driver.find_elements(:class_name => "redbox").should_not be_empty
    end

    it "should still fail to find elements when implicit waits are enabled" do
      driver.manage.timeouts.implicit_wait = 0.5
      driver.find_elements(:class_name => "redbox").should be_empty
    end

    it "should return after first attempt to find many after disabling implicit waits" do
      add = driver.find_element(:id => "adder")

      driver.manage.timeouts.implicit_wait = 3
      driver.manage.timeouts.implicit_wait = 0
      add.click

      driver.find_elements(:class_name => "redbox").should be_empty
    end
  end

  context "page loads" do
    after { driver.manage.timeouts.page_load = -1 }

    compliant_on :browser => :firefox do
      it "should be able to set the page load timeout" do
        driver.manage.timeouts.page_load = 2
        # TODO: actually test something
      end
    end
  end

end
