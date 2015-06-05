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

module Selenium
  module WebDriver
    describe Keyboard do

      not_compliant_on :browser => [:chrome, :android, :iphone, :safari] do
        it "sends keys to the active element" do
          driver.navigate.to url_for("bodyTypingTest.html")

          driver.keyboard.send_keys "ab"

          text = driver.find_element(:id => "body_result").text.strip
          text.should == "keypress keypress"

          driver.find_element(:id => "result").text.strip.should be_empty
        end

        it "can send keys with shift pressed" do
          driver.navigate.to url_for("javascriptPage.html")

          event_input = driver.find_element(:id => "theworks")
          keylogger   = driver.find_element(:id => "result")

          driver.mouse.click event_input

          driver.keyboard.press :shift
          driver.keyboard.send_keys "ab"
          driver.keyboard.release :shift

          event_input.attribute(:value).should == "AB"
          keylogger.text.strip.should =~ /^(focus )?keydown keydown keypress keyup keydown keypress keyup keyup$/
        end

        it "raises an ArgumentError if the pressed key is not a modifier key" do
          lambda { driver.keyboard.press :return }.should raise_error(ArgumentError)
        end

        it "can press and release modifier keys" do
          driver.navigate.to url_for("javascriptPage.html")

          event_input = driver.find_element(:id => "theworks")
          keylogger   = driver.find_element(:id => "result")

          driver.mouse.click event_input

          driver.keyboard.press :shift
          keylogger.text.should =~ /keydown$/

          driver.keyboard.release :shift
          keylogger.text.should =~ /keyup$/
        end
      end

    end # Keyboard
  end # WebDriver
end # Selenium
