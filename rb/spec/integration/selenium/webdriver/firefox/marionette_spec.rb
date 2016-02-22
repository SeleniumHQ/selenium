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
      before do
        @opt = GlobalTestEnv.remote_server? ? {:url => GlobalTestEnv.remote_server.webdriver_url} : {}
      end

      compliant_on :driver => :marionette do
        it "takes a binary path as an argument" do
          pending "Set ENV['ALTERNATE_FIREFOX_PATH'] to test this" unless ENV['ALTERNATE_FIREFOX_PATH']
          pending "Set ENV['MARIONETTE_PATH'] to test this" unless ENV['MARIONETTE_PATH']

          begin
            caps = Remote::Capabilities.firefox(:firefox_binary => ENV['MARIONETTE_PATH'])
            driver1 = Selenium::WebDriver.for :firefox, :desired_capabilities => caps, :marionette => true

            default_version = driver1.capabilities.version
            driver1.quit

            caps = Remote::Capabilities.firefox(:firefox_binary => ENV['ALTERNATE_FIREFOX_PATH'])
            driver2 = Selenium::WebDriver.for :firefox, :desired_capabilities => caps, :marionette => true

            expect(driver2.capabilities.version).to_not be == default_version
            driver2.quit
          end
        end
      end

      context "when designated firefox binary includes Marionette" do
        before do
          unless ENV['MARIONETTE_PATH']
            pending "Set ENV['MARIONETTE_PATH'] to test Marionette enabled Firefox installations"
          end
        end

        compliant_on :browser => :marionette do
          # This passes in isolation, but can not run in suite due to combination of
          # https://bugzilla.mozilla.org/show_bug.cgi?id=1228107 & https://github.com/SeleniumHQ/selenium/issues/1150
          not_compliant_on :driver => :remote do
            it "Uses Wires when setting marionette option in capabilities" do
              cap_opts = {:marionette => true}
              cap_opts.merge!(:firefox_binary => ENV['MARIONETTE_PATH']) unless GlobalTestEnv.driver == :remote
              caps = Selenium::WebDriver::Remote::Capabilities.firefox cap_opts
              @opt.merge!(:desired_capabilities => caps)
              expect {@driver = Selenium::WebDriver.for GlobalTestEnv.driver, @opt}.to_not raise_exception
              @driver.quit
            end
          end
        end

        compliant_on :browser => :marionette do
          # This passes in isolation, but can not run in suite due to combination of
          # https://bugzilla.mozilla.org/show_bug.cgi?id=1228107 & https://github.com/SeleniumHQ/selenium/issues/1150
          not_compliant_on :driver => :remote do
            it "Uses Wires when setting marionette option in driver initialization" do
              cap_opts = GlobalTestEnv.driver == :remote ? {} : {:firefox_binary => ENV['MARIONETTE_PATH']}
              caps = Selenium::WebDriver::Remote::Capabilities.firefox cap_opts
              @opt.merge!(:marionette => true, :desired_capabilities => caps)
              @driver = Selenium::WebDriver.for GlobalTestEnv.driver, @opt

              expect(@driver.capabilities[:takes_element_screenshot]).to_not be_nil
              @driver.quit
            end
          end
        end

        # test with firefox due to https://bugzilla.mozilla.org/show_bug.cgi?id=1228121
        compliant_on :browser => :firefox do
          it "Does not use wires when marionette option is not set" do
            @driver = Selenium::WebDriver.for GlobalTestEnv.driver, @opt

            expect(@driver.capabilities[:takes_element_screenshot]).to be_nil
            @driver.quit
          end
        end

        compliant_on :browser => :marionette do
          # https://bugzilla.mozilla.org/show_bug.cgi?id=1228107
          not_compliant_on :browser => :marionette do
            it_behaves_like "driver that can be started concurrently", :marionette
          end
        end
      end

      compliant_on :browser => :firefox do
        # These pass in isolation, but can not run in suite due to https://github.com/SeleniumHQ/selenium/issues/1150
        not_compliant_on :driver => :remote do
          context "when designated firefox binary does not include Marionette" do
            let(:message) { /Marionette is not supported in Firefox Version \d\d/ }

            before do
              unless ENV['PRE_MARIONETTE_PATH']
                pending "Set ENV['PRE_MARIONETTE_PATH'] to test features on firefox versions without marionette"
              end
            end

            it "Raises Wires Exception when setting marionette option in capabilities" do
              caps = Selenium::WebDriver::Remote::Capabilities.firefox(:marionette => true,
                                                                       :firefox_binary => ENV['PRE_MARIONETTE_PATH'])
              @opt.merge!(:desired_capabilities => caps)
              expect { Selenium::WebDriver.for GlobalTestEnv.driver, @opt }.to raise_exception Error::WebDriverError, message
            end

            it "Raises Wires Exception when setting marionette option in driver initialization" do
              caps = Selenium::WebDriver::Remote::Capabilities.firefox(:firefox_binary => ENV['PRE_MARIONETTE_PATH'])
              @opt.merge!(:marionette => true, :desired_capabilities => caps)
              expect{ Selenium::WebDriver.for GlobalTestEnv.driver, @opt}.to raise_exception Error::WebDriverError, message
            end
          end
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
