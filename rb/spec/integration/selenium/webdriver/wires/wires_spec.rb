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

require_relative '../spec_helper'

module Selenium
  module WebDriver

    compliant_on :driver => :wires do
      describe Firefox do

        context "when designated firefox installation includes Marionette" do
          before(:all) { Firefox::Binary.path = "/Applications/FirefoxDeveloperEdition.app/Contents/MacOS/firefox-bin" }
          after { @driver.quit }

          # Currently versions that support Wires do not support Legacy Firefox Extension
          xit "Does not use wires by default" do
            @driver = Selenium::WebDriver.for :firefox
            expect(@driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to_not be_nil
          end

          it "Uses Wires when initialized with :desired_capabilities" do
            caps = Selenium::WebDriver::Remote::W3CCapabilities.firefox
            expect { @driver = Selenium::WebDriver.for :firefox, :desired_capabilities => caps }.to_not raise_exception
          end

          it "Uses Wires when initialized with wires option" do
            @driver = Selenium::WebDriver.for :firefox, {wires: true}
            expect(@driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to be_nil
          end
        end

        context "when designated firefox installation does not include Marionette" do
          before(:all) { Firefox::Binary.path = "/Applications/Firefox.app/Contents/MacOS/firefox-bin" }
          let(:message) { /Firefox Version \d\d does not support W3CCapabilities/ }

          it "Does not use Wires by default" do
            driver = Selenium::WebDriver.for :firefox
            expect(driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to_not be_nil
            driver.quit
          end

          it "Raises Wires Exception when initialized with :desired_capabilities" do
            caps = Selenium::WebDriver::Remote::W3CCapabilities.firefox
            opt = {:desired_capabilities => caps}
            expect { @driver = Selenium::WebDriver.for :firefox, opt }.to raise_exception ArgumentError, message
          end

          it "Raises Wires Exception when initialized with wires option" do
            expect{@driver = Selenium::WebDriver.for :firefox, {wires: true}}.to raise_exception ArgumentError, message
          end
        end

      end
    end
  end # WebDriver
end # Selenium
