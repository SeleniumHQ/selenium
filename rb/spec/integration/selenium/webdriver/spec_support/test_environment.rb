# frozen_string_literal: true

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
        attr_reader :driver

        def initialize
          @create_driver_error = nil
          @create_driver_error_count = 0

          extract_browser_from_bazel_target_name

          @driver = (ENV['WD_SPEC_DRIVER'] || :chrome).to_sym
          @driver_instance = nil
        end

        def print_env
          puts "\nRunning Ruby specs:\n\n"

          env = current_env.merge(ruby: RUBY_DESCRIPTION)

          just = current_env.keys.map { |e| e.to_s.size }.max
          env.each do |key, value|
            puts "#{key.to_s.rjust(just)}: #{value}"
          end

          puts "\n"
        end

        def browser
          driver == :remote ? (ENV['WD_REMOTE_BROWSER'] || :chrome).to_sym : driver
        end

        def driver_instance
          @driver_instance || create_driver!
        end

        def reset_driver!(time = 0)
          quit_driver
          sleep time
          driver_instance
        end

        # TODO: optimize since this approach is not assured on IE
        def ensure_single_window
          driver_instance.window_handles[1..-1].each do |handle|
            driver_instance.switch_to.window(handle)
            driver_instance.close
          end
          driver_instance.switch_to.window(driver_instance.window_handles.first)
        end

        def quit_driver
          return unless @driver_instance

          @driver_instance.quit
        ensure
          @driver_instance = nil
        end

        def app_server
          @app_server ||= RackServer.new(root.join('common/src/web').to_s).tap(&:start)
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
          test_jar = "#{Pathname.new(Dir.pwd).join('rb')}/selenium_server_deploy.jar"
          built_jar = root.join('bazel-bin/java/src/org/openqa/selenium/grid/selenium_server_deploy.jar')
          jar = if File.exist?(test_jar) && ENV['DOWNLOAD_SERVER'].nil?
                  test_jar
                elsif File.exist?(built_jar) && ENV['DOWNLOAD_SERVER'].nil?
                  built_jar
                else
                  Selenium::Server.download(:latest)
                end

          WebDriver.logger.info "Server Location: #{jar}"
          jar.to_s
        end

        def quit
          app_server.stop

          @remote_server.stop if defined? @remote_server

          @driver_instance = @app_server = @remote_server = nil
        end

        def url_for(filename)
          app_server.where_is filename
        end

        def root
          # prefer #realpath over #expand_path to avoid problems with UNC
          # see https://bugs.ruby-lang.org/issues/13515
          @root ||= Pathname.new('../../../../../../../').realpath(__FILE__)
        end

        def create_driver!(**opts, &block)
          check_for_previous_error

          method = "create_#{driver}_driver".to_sym
          instance = if private_methods.include?(method)
                       send method, opts
                     else
                       WebDriver::Driver.for(driver, opts)
                     end
          @create_driver_error_count -= 1 unless @create_driver_error_count.zero?
          if block
            begin
              yield(instance)
            ensure
              instance.quit
            end
          else
            @driver_instance = instance
          end
        rescue StandardError => e
          @create_driver_error = e
          @create_driver_error_count += 1
          raise e
        end

        private

        def current_env
          {
            browser: browser,
            driver: driver,
            version: driver_instance.capabilities.version,
            platform: Platform.os,
            ci: Platform.ci
          }
        end

        MAX_ERRORS = 4

        class DriverInstantiationError < StandardError
        end

        def check_for_previous_error
          return unless @create_driver_error && @create_driver_error_count >= MAX_ERRORS

          msg = "previous #{@create_driver_error_count} instantiations of driver #{driver.inspect} failed,"
          msg += " not trying again (#{@create_driver_error.message})"

          raise DriverInstantiationError, msg, @create_driver_error.backtrace
        end

        def create_remote_driver(opt = {})
          options = opt.delete(:capabilities)
          opt[:capabilities] = [WebDriver::Remote::Capabilities.send(browser)]
          opt[:capabilities] << options if options
          opt[:url] = ENV['WD_REMOTE_URL'] || remote_server.webdriver_url
          opt[:http_client] ||= WebDriver::Remote::Http::Default.new

          WebDriver::Driver.for(:remote, opt)
        end

        def create_firefox_driver(opt = {})
          WebDriver::Firefox.path = ENV['FIREFOX_BINARY'] if ENV['FIREFOX_BINARY']
          WebDriver::Driver.for :firefox, opt
        end

        def create_firefox_nightly_driver(opt = {})
          ENV['FIREFOX_BINARY'] = ENV['FIREFOX_NIGHTLY_BINARY']
          opt[:capabilities] = WebDriver::Firefox::Options.new(debugger_address: true)
          create_firefox_driver(opt)
        end

        def create_ie_driver(opt = {})
          opt[:capabilities] = WebDriver::IE::Options.new(require_window_focus: true)
          WebDriver::Driver.for :ie, opt
        end

        def create_chrome_driver(opt = {})
          WebDriver::Chrome.path = ENV['CHROME_BINARY'] if ENV['CHROME_BINARY']
          WebDriver::Driver.for :chrome, opt
        end

        def create_safari_preview_driver(opt = {})
          WebDriver::Safari.technology_preview!
          WebDriver::Driver.for :safari, opt
        end

        def create_edge_driver(opt = {})
          WebDriver::Edge.path = ENV['EDGE_BINARY'] if ENV['EDGE_BINARY']
          WebDriver::Driver.for :edge, opt
        end

        def extract_browser_from_bazel_target_name
          name = ENV['TEST_TARGET']
          return unless name

          case name
          when %r{//rb:remote-(.+)-test}
            ENV['WD_REMOTE_BROWSER'] = Regexp.last_match(1).tr('-', '_')
            ENV['WD_SPEC_DRIVER'] = 'remote'
          when %r{//rb:(.+)-test}
            ENV['WD_SPEC_DRIVER'] = Regexp.last_match(1).tr('-', '_')
          else
            raise "Don't know how to extract browser name from #{name}"
          end
        end
      end
    end # SpecSupport
  end # WebDriver
end # Selenium
