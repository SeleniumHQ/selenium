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
          if ENV['DOWNLOAD_SERVER']
            @remote_server_jar ||= "#{root.join('rb/selenium-server-standalone').to_s}-#{Selenium::Server.latest}.jar"
            @remote_server_jar = root.join("rb/#{Selenium::Server.download(:latest)}").to_s unless File.exist? @remote_server_jar
          else
            @remote_server_jar ||= root.join('buck-out/gen/java/server/src/org/openqa/grid/selenium/selenium.jar').to_s
          end
          @remote_server_jar
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
          # prefer #realpath over #expand_path to avoid problems with UNC
          # see https://bugs.ruby-lang.org/issues/13515
          @root ||= Pathname.new('../../../../../../../').realpath(__FILE__)
        end

        def remote_capabilities
          opt = {}
          browser_name = case browser
                         when :ff_esr
                           unless ENV['FF_ESR_BINARY']
                             raise DriverInstantiationError, "ENV['FF_ESR_BINARY'] must be set to test Firefox ESR"
                           end

                           opt[:firefox_binary] = ENV['FF_ESR_BINARY']
                           opt[:marionette] = false
                           :firefox
                         when :ff_nightly
                           unless ENV['FF_NIGHTLY_BINARY']
                             raise DriverInstantiationError, "ENV['FF_NIGHTLY_BINARY'] must be set to test Firefox Nightly"
                           end
                           opt[:firefox_binary] = ENV['FF_NIGHTLY_BINARY']
                           :firefox
                         when :safari_preview
                           opt["safari.options"] = {'technologyPreview' => true}
                           :safari
                         else
                           browser
                         end

          caps = WebDriver::Remote::Capabilities.send(browser_name, opt)

          unless caps.is_a? WebDriver::Remote::W3C::Capabilities
            caps.javascript_enabled = true
            caps.css_selectors_enabled = true
          end

          caps
        end

        private

        def create_driver(opt = {})
          method = "create_#{driver}_driver".to_sym
          instance = if private_methods.include?(method)
                       send method, opt
                     else
                       WebDriver::Driver.for(driver, opt)
                     end
          @create_driver_error_count -= 1 unless @create_driver_error_count == 0
          instance
        rescue => ex
          @create_driver_error = ex
          @create_driver_error_count += 1
          raise ex
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

        def create_remote_driver(opt = {})
          opt[:desired_capabilities] ||= remote_capabilities
          opt[:url] ||= ENV['WD_REMOTE_URL'] || remote_server.webdriver_url
          opt[:http_client] ||= keep_alive_client || http_client

          WebDriver::Driver.for(:remote, opt)
        end

        def create_firefox_driver(opt = {})
          WebDriver::Firefox::Binary.path = ENV['FIREFOX_BINARY'] if ENV['FIREFOX_BINARY']
          WebDriver::Driver.for :firefox, opt
        end

        def create_ff_esr_driver(opt = {})
          unless ENV['FF_ESR_BINARY']
            raise StandardError, "ENV['FF_ESR_BINARY'] must be set to test ESR Firefox"
          end
          WebDriver::Firefox::Binary.path = ENV['FF_ESR_BINARY']

          opt[:desired_capabilities] ||= WebDriver::Remote::Capabilities.firefox(marionette: false)

          WebDriver::Driver.for :firefox, opt
        end

        def create_ie_driver(opt = {})
          opt[:desired_capabilities] ||= WebDriver::Remote::Capabilities.ie
          opt[:desired_capabilities]['requireWindowFocus'] = true

          WebDriver::Driver.for :ie, opt
        end

        def create_ff_nightly_driver(opt = {})
          unless ENV['FF_NIGHTLY_BINARY']
            raise StandardError, "ENV['FF_NIGHTLY_BINARY'] must be set to test Nightly Firefox"
          end
          WebDriver::Firefox::Binary.path = ENV['FF_NIGHTLY_BINARY']
          opt[:marionette] = true
          WebDriver::Driver.for :firefox, opt
        end

        def create_chrome_driver(opt = {})
          binary = ENV['CHROME_BINARY']
          WebDriver::Chrome.path = binary if binary

          server = ENV['CHROMEDRIVER'] || ENV['chrome_server']
          WebDriver::Chrome.driver_path = server if server

          opt[:args] ||= ENV['TRAVIS'] ? ['--no-sandbox'] : []

          WebDriver::Driver.for :chrome, opt
        end

        def create_phantomjs_driver(opt = {})
          binary = ENV['PHANTOMJS_BINARY']
          WebDriver::PhantomJS.path = binary if binary
          WebDriver::Driver.for :phantomjs, opt
        end

        def create_safari_preview_driver(opt = {})
          Safari.technology_preview!
          WebDriver::Driver.for :safari, opt
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
