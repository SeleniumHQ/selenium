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

    describe Firefox do
      compliant_on :browser => :marionette do
        context "when designated firefox binary includes Marionette" do
          before(:each) do
            Selenium::WebDriver::Firefox::Binary.path = ENV['MARIONETTE_PATH']
          end

          it "Uses Wires when initialized with W3C desired_capabilities" do
            caps = Selenium::WebDriver::Remote::W3CCapabilities.firefox
            expect do
              @driver = Selenium::WebDriver.for :firefox, :desired_capabilities => caps
            end.to_not raise_exception
            @driver.quit
          end

          it "Uses Wires when initialized with non W3C desired_capabilities using marionette option" do
            caps = Selenium::WebDriver::Remote::Capabilities.firefox(:marionette => true)
            expect do
              @driver = Selenium::WebDriver.for :firefox, :desired_capabilities => caps
            end.to_not raise_exception
            @driver.quit
          end

          it "Uses Wires when initialized with marionette option" do
            @driver = Selenium::WebDriver.for :firefox, {marionette: true}
            expect(@driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to be_nil
            @driver.quit
          end

          not_compliant_on :browser => :marionette do
            it "Does not use wires by default" do
              unless ENV['MARIONETTE_PATH']
                pending "Set ENV['MARIONETTE_PATH'] to test Marionette enabled Firefox installations"
              end

              Selenium::WebDriver::Firefox::Binary.path = ENV['MARIONETTE_PATH']
              @driver = Selenium::WebDriver.for :firefox
              expect(@driver.instance_variable_get('@bridge').instance_variable_get('@launcher')).to_not be_nil
              @driver.quit
            end
          end

          not_compliant_on :browser => :marionette do
            it_behaves_like "driver that can be started concurrently", :marionette
          end
        end
      end

      compliant_on :browser => :firefox do
        context "when designated firefox binary does not include Marionette" do
          let(:message) { /Firefox Version \d\d does not support Marionette/ }

          it "Raises Wires Exception when initialized with :desired_capabilities" do
            caps = Selenium::WebDriver::Remote::W3CCapabilities.firefox
            opt = {:desired_capabilities => caps}
            expect { Selenium::WebDriver.for :firefox, opt }.to raise_exception ArgumentError, message
          end

          it "Raises Wires Exception when initialized with marionette option" do
            expect{Selenium::WebDriver.for :firefox, {marionette: true}}.to raise_exception ArgumentError, message
          end

          it "Raises Wires Exception when initialized with marionette option" do
            expect{Selenium::WebDriver.for :firefox, {marionette: true}}.to raise_exception ArgumentError, message
          end
        end
      end
    end
  end # WebDriver
end # Selenium
