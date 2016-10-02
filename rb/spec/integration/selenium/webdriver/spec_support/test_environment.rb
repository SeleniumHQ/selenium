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

module Selenium
  module WebDriver
    module SpecSupport
      class TestEnvironment
        attr_accessor :unguarded
        attr_reader :driver

        def initialize
          @create_driver_error = nil
          @create_driver_error_count = 0

          @driver = (ENV['WD_SPEC_DRIVER'] || :chrome).to_sym
        end

        def browser
          if driver == :remote
            (ENV['WD_REMOTE_BROWSER'] || :chrome).to_sym
          else
            driver
          end
        end

        def driver_instance
          @driver_instance ||= new_driver_instance
        end

        def reset_driver!(time = 0)
          quit_driver
          sleep time
          @driver_instance = new_driver_instance
        end

        def ensure_single_window
          @driver_instance.window_handles[1..-1].each do |handle|
            @driver_instance.switch_to.window(handle)
            @driver_instance.close
          end
          @driver_instance.switch_to.window @driver_instance.window_handles.first
        end

        def quit_driver
          return unless @driver_instance
          @driver_instance.quit
          @driver_instance = nil
        end

        def new_driver_instance
          check_for_previous_error
          create_driver
        end

        def app_server
          @app_server ||= (
            s = RackServer.new(root.join('common/src/web').to_s)
            s.start

            s
          )
        end

        def remote_server
          @remote_server ||= Selenium::Server.new(
            remote_server_jar,
            port: PortProber.above(4444),
            log: $DEBUG,
            background: true,
            timeout: 60
          )
        end

        def reset_remote_server
          @remote_server.stop if defined? @remote_server
          @remote_server = nil
          remote_server
        end

        def remote_server?
          !@remote_server.nil?
        end

        def remote_server_jar
          @remote_server_jar ||= root.join('buck-out/gen/java/server/src/org/openqa/grid/selenium/selenium.jar').to_s
        end

        def quit
          app_server.stop

          @remote_server.stop if defined? @remote_server

          @driver_instance = @app_server = @remote_server = nil
        ensure
          Guards.report
        end

        def unguarded?
          @unguarded ||= false
        end

        def native_events?
          @native_events ||= ENV['native'] == 'true'
        end

        def url_for(filename)
          app_server.where_is filename
        end

        def root
          @root ||= Pathname.new('../../../../../../../').expand_path(__FILE__)
        end

        private

        def create_driver
          method = "create_#{driver}_driver".to_sym
          instance = if private_methods.include?(method)
                       send method
                     else
                       WebDriver::Driver.for(driver)
                     end
          @create_driver_error_count -= 1 unless @create_driver_error_count == 0
          instance
        rescue => ex
          @create_driver_error = ex
          @create_driver_error_count += 1
          raise ex
        end

        def remote_capabilities
          opt = {}
          browser_name = if browser == :ff_legacy
                           unless ENV['FF_LEGACY_BINARY']
                             raise DriverInstantiationError, "ENV['FF_LEGACY_BINARY'] must be set to test legacy firefox"
                           end

                           opt[:firefox_binary] = ENV['FF_LEGACY_BINARY']
                           opt[:marionette] = false
                           :firefox
                         else
                           browser
                         end

          caps = WebDriver::Remote::Capabilities.send(browser_name, opt)

          unless caps.is_a? WebDriver::Remote::W3CCapabilities
            caps.javascript_enabled = true
            caps.css_selectors_enabled = true
          end

          caps
        end

        MAX_ERRORS = 4

        class DriverInstantiationError < StandardError
        end

        def check_for_previous_error
          return unless @create_driver_error && @create_driver_error_count >= MAX_ERRORS

          msg = "previous #{@create_driver_error_count} instantiations of driver #{driver.inspect} failed, not trying again"
          msg << " (#{@create_driver_error.message})"

          raise DriverInstantiationError, msg, @create_driver_error.backtrace
        end

        def create_remote_driver
          WebDriver::Driver.for(
            :remote,
            desired_capabilities: remote_capabilities,
            url: ENV['WD_REMOTE_URL'] || remote_server.webdriver_url,
            http_client: keep_alive_client || http_client
          )
        end

        def create_firefox_driver
          WebDriver::Firefox::Binary.path = ENV['FIREFOX_BINARY'] if ENV['FIREFOX_BINARY']
          WebDriver::Driver.for :firefox
        end

        def create_ff_legacy_driver
          unless ENV['FF_LEGACY_BINARY']
            raise StandardError, "ENV['FF_LEGACY_BINARY'] must be set to test legacy firefox"
          end
          WebDriver::Firefox::Binary.path = ENV['FF_LEGACY_BINARY']

          caps = WebDriver::Remote::Capabilities.firefox(marionette: false)

          WebDriver::Driver.for :firefox, desired_capabilities: caps
        end

        def create_chrome_driver
          binary = ENV['CHROME_BINARY']
          WebDriver::Chrome.path = binary if binary

          server = ENV['CHROMEDRIVER'] || ENV['chrome_server']
          WebDriver::Chrome.driver_path = server if server

          args = ENV['TRAVIS'] ? ['--no-sandbox'] : []

          WebDriver::Driver.for :chrome,
                                args: args
        end

        def create_phantomjs_driver
          binary = ENV['PHANTOMJS_BINARY']
          WebDriver::PhantomJS.path = binary if binary
          WebDriver::Driver.for :phantomjs
        end

        def create_safari_driver
          WebDriver::Safari.driver_path = ENV['SAFARIDRIVER'] if ENV['SAFARIDRIVER']
          WebDriver::Driver.for :safari
        end

        def keep_alive_client
          require 'selenium/webdriver/remote/http/persistent'
          STDERR.puts 'INFO: using net-http-persistent'

          Selenium::WebDriver::Remote::Http::Persistent.new
        rescue LoadError
          # net-http-persistent not available
        end

        def http_client
          Selenium::WebDriver::Remote::Http::Default.new
        end
      end
    end # SpecSupport
  end # WebDriver
end # Selenium
