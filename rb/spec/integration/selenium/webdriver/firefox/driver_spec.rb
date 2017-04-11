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
    compliant_on browser: [:firefox, :ff_nightly] do
      describe Firefox do
        def restart_remote_server
          server = GlobalTestEnv.reset_remote_server
          server.start
          server.webdriver_url
        end

        before(:all) do
          driver
          quit_driver
        end

        before(:each) do
          @opt = {}
          @browser = if GlobalTestEnv.driver == :remote
                       @opt[:url] = restart_remote_server
                       :remote
                     else
                       :firefox
                     end
        end

        not_compliant_on driver: :remote do
          it 'creates default capabilities' do
            begin
              driver1 = Selenium::WebDriver.for(@browser, @opt)
              caps = driver1.capabilities
              expect(caps.proxy).to be_nil
              expect(caps.platform_name).to_not be_nil
              expect(caps.browser_version).to match(/^\d\d\./)
              expect(caps.platform_version).to_not be_nil

              compliant_on browser: :ff_nightly do
                expect(caps.accept_insecure_certs).to be == false
                expect(caps.page_load_strategy).to be == 'normal'
                expect(caps.accessibility_checks).to be == false
                expect(caps.implicit_timeout).to be == 0
                expect(caps.page_load_timeout).to be == 300000
                expect(caps.script_timeout).to be == 30000
              end

              expect(caps.remote_session_id).to be_nil

              compliant_on browser: :ff_esr do
                expect(caps.rotatable).to be == false
              end
            ensure
              driver1.quit
            end
          end
        end

        # Remote needs to implement firefox options
        not_compliant_on driver: :remote do
          it 'takes a binary path as an argument' do
            pending "Set ENV['ALT_FIREFOX_BINARY'] to test this" unless ENV['ALT_FIREFOX_BINARY']
            begin
              @path = Firefox::Binary.path
              driver1 = Selenium::WebDriver.for @browser, @opt.dup

              default_version = driver1.capabilities.version
              expect { driver1.capabilities.browser_version }.to_not raise_exception
              driver1.quit

              caps = Remote::Capabilities.firefox(firefox_options: {binary: ENV['ALT_FIREFOX_BINARY']})
              @opt[:desired_capabilities] = caps
              driver2 = Selenium::WebDriver.for @browser, @opt

              expect(driver2.capabilities.version).to_not eql(default_version)
              expect { driver2.capabilities.browser_version }.to_not raise_exception
              driver2.quit
            ensure
              Firefox::Binary.path = @path
            end
          end

          it 'gives precedence to firefox options versus argument switch' do
            pending "Set ENV['ALT_FIREFOX_BINARY'] to test this" unless ENV['ALT_FIREFOX_BINARY']
            begin
              @path = Firefox::Binary.path
              driver1 = Selenium::WebDriver.for @browser, @opt.dup

              default_path = Firefox::Binary.path
              default_version = driver1.capabilities.version
              driver1.quit

              caps = Remote::Capabilities.firefox(firefox_options: {binary: ENV['ALT_FIREFOX_BINARY']},
                                                  service_args: {binary: default_path})
              @opt[:desired_capabilities] = caps
              driver2 = Selenium::WebDriver.for @browser, @opt

              expect(driver2.capabilities.version).to_not eql(default_version)
              expect { driver2.capabilities.browser_version }.to_not raise_exception
              driver2.quit
            ensure
              Firefox::Binary.path = @path
            end
          end
        end

        context 'when shared example' do
          it_behaves_like 'driver that can be started concurrently', :firefox
        end
      end
    end
  end # WebDriver
end # Selenium
