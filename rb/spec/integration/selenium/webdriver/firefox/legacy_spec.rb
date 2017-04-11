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
      compliant_on browser: :ff_esr do
        describe Driver do
          describe '.new' do
            before do
              @opt = {}
              @opt[:url] = GlobalTestEnv.remote_server.webdriver_url if GlobalTestEnv.driver == :remote
            end

            not_compliant_on driver: :remote do
              it 'takes a Firefox::Profile instance as argument' do
                begin
                  @opt[:desired_capabilities] = Remote::Capabilities.firefox(marionette: false)
                  profile = Selenium::WebDriver::Firefox::Profile.new
                  @opt[:profile] = profile
                  driver2 = Selenium::WebDriver.for :firefox, @opt

                  stored_profile = driver2.instance_variable_get('@launcher')
                                          .instance_variable_get('@profile')
                  expect(stored_profile).to be == profile
                ensure
                  driver2.quit if driver2
                end
              end
            end
          end

          it_behaves_like 'driver that can be started concurrently', :ff_esr
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
