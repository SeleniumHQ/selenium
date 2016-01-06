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
    module Firefox

      compliant_on :browser => :firefox do
        describe Driver do
          describe ".new" do

            it "takes a binary path as an argument" do
              pending "Set ENV['ALTERNATE_FIREFOX_PATH'] to test this" unless ENV['ALTERNATE_FIREFOX_PATH']

              begin
                default_path = Firefox::Binary.path

                driver1 = Selenium::WebDriver.for :firefox
                default_version = driver1.capabilities[:version]
                driver1.quit

                caps = Remote::Capabilities.firefox(firefox_binary: ENV['ALTERNATE_FIREFOX_PATH'])
                driver2 = Selenium::WebDriver.for :firefox, :desired_capabilities => caps

                expect(driver2.capabilities[:version]).to_not be == default_version
                driver2.quit
              ensure
                Firefox::Binary.path = default_path
              end
            end

            it "takes a Firefox::Profile instance as argument" do
              begin
                profile = Selenium::WebDriver::Firefox::Profile.new
                driver = Selenium::WebDriver.for :firefox, :profile => profile
                stored_profile = driver.instance_variable_get('@bridge').instance_variable_get('@launcher').instance_variable_get('@profile')
                expect(stored_profile).to be == profile
              ensure
                driver.quit if driver
              end
            end
          end

          it_behaves_like "driver that can be started concurrently", :firefox

        end # Driver
      end

    end # Firefox
  end # WebDriver
end # Selenium
