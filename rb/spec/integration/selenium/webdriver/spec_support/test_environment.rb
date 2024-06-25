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

          $LOAD_PATH.insert(0, root.join('bazel-bin/rb/lib').to_s) if File.exist?(root.join('bazel-bin/rb/lib'))
          WebDriver.logger.ignore(:logger_info)
          SeleniumManager.bin_path = root.join('bazel-bin/rb/bin').to_s if File.exist?(root.join('bazel-bin/rb/bin'))

          @driver = ENV.fetch('WD_SPEC_DRIVER', 'chrome').tr('-', '_').to_sym
          @driver_instance = nil
          @remote_server = nil
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
          if driver == :remote
            ENV.fetch('WD_REMOTE_BROWSER', 'chrome').tr('-', '_').to_sym
          else
            driver
          end
        end

        def driver_instance(...)
          @driver_instance || create_driver!(...)
        end

        def reset_driver!(time: 0, **opts, &block)
          # do not reset if the test was marked skipped
          return if opts.delete(:example)&.metadata&.fetch(:skip, nil)

          quit_driver
          sleep time
          driver_instance(**opts, &block)
        end

        def quit_driver
          @driver_instance&.quit
        rescue StandardError
          # good riddance
        ensure
          @driver_instance = nil
        end

        def app_server
          @app_server ||= begin
            app_server = RackServer.new(root.join('common/src/web').to_s, random_port)
            app_server.start

            app_server
          end
        end

        def remote_server
          args = if ENV.key?('CHROMEDRIVER_BINARY')
                   ["-Dwebdriver.chrome.driver=#{ENV['CHROMEDRIVER_BINARY']}"]
                 elsif ENV.key?('MSEDGEDRIVER_BINARY')
                   ["-Dwebdriver.edge.driver=#{ENV['MSEDGEDRIVER_BINARY']}"]
                 elsif ENV.key?('GECKODRIVER_BINARY')
                   ["-Dwebdriver.gecko.driver=#{ENV['GECKODRIVER_BINARY']}"]
                 else
                   %w[--selenium-manager true --enable-managed-downloads true]
                 end

          @remote_server ||= Selenium::Server.new(
            remote_server_jar,
            java: bazel_java,
            port: random_port,
            log_level: WebDriver.logger.debug? && 'FINE',
            background: true,
            timeout: 60,
            args: args
          )
        end

        def bazel_java
          return unless ENV.key?('WD_BAZEL_JAVA_LOCATION')

          File.expand_path(File.read(File.expand_path(ENV.fetch('WD_BAZEL_JAVA_LOCATION'))).chomp)
        end

        def rbe?
          Dir.pwd.start_with?('/mnt/engflow')
        end

        def reset_remote_server
          @remote_server&.stop
          @remote_server = nil
          remote_server
        end

        def remote_server?
          !@remote_server.nil?
        end

        def remote_server_jar
          jar = 'java/src/org/openqa/selenium/grid/selenium_server_deploy.jar'
          test_jar = Pathname.new(Dir.pwd).join(jar)
          built_jar = root.join("bazel-bin/#{jar}")
          jar = if File.exist?(test_jar) && ENV['DOWNLOAD_SERVER'].nil?
                  test_jar
                elsif File.exist?(built_jar) && ENV['DOWNLOAD_SERVER'].nil?
                  built_jar
                else
                  Selenium::Server.download
                end

          WebDriver.logger.info "Server Location: #{jar}"
          jar.to_s
        end

        def quit
          @app_server&.stop

          @remote_server&.stop

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

        def create_driver!(listener: nil, **opts, &block)
          check_for_previous_error

          method = :"#{driver}_driver"
          instance = if private_methods.include?(method)
                       send(method, listener: listener, options: build_options(**opts))
                     else
                       WebDriver::Driver.for(driver, listener: listener, options: build_options(**opts))
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

        def build_options(**opts)
          options_method = :"#{browser}_options"
          if private_methods.include?(options_method)
            send(options_method, **opts)
          else
            WebDriver::Options.send(browser, **opts)
          end
        end

        def current_env
          {
            browser: browser,
            driver: driver,
            version: driver_instance.capabilities.browser_version,
            platform: Platform.os,
            ci: Platform.ci,
            rbe: rbe?
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

        def remote_driver(**opts)
          url = ENV.fetch('WD_REMOTE_URL', remote_server.webdriver_url)

          WebDriver::Driver.for(:remote, url: url, **opts)
        end

        def chrome_driver(service: nil, **opts)
          service ||= WebDriver::Service.chrome
          service.args << '--disable-build-check' if ENV['DISABLE_BUILD_CHECK']
          service.args << '--verbose' if WebDriver.logger.debug?
          service.executable_path = ENV['CHROMEDRIVER_BINARY'] if ENV.key?('CHROMEDRIVER_BINARY')
          WebDriver::Driver.for(:chrome, service: service, **opts)
        end

        def edge_driver(service: nil, **opts)
          service ||= WebDriver::Service.edge
          service.args << '--disable-build-check' if ENV['DISABLE_BUILD_CHECK']
          service.args << '--verbose' if WebDriver.logger.debug?
          service.executable_path = ENV['MSEDGEDRIVER_BINARY'] if ENV.key?('MSEDGEDRIVER_BINARY')
          WebDriver::Driver.for(:edge, service: service, **opts)
        end

        def firefox_driver(service: nil, **opts)
          service ||= WebDriver::Service.firefox
          service.args.push('--log', 'trace') if WebDriver.logger.debug?
          service.executable_path = ENV['GECKODRIVER_BINARY'] if ENV.key?('GECKODRIVER_BINARY')
          WebDriver::Driver.for(:firefox, service: service, **opts)
        end

        def safari_driver(**opts)
          service_opts = WebDriver.logger.debug? ? {args: '--diagnose'} : {}
          service = WebDriver::Service.safari(**service_opts)
          WebDriver::Driver.for(:safari, service: service, **opts)
        end

        def safari_preview_driver(**opts)
          service_opts = WebDriver.logger.debug? ? {args: '--diagnose'} : {}
          service = WebDriver::Service.safari(**service_opts)
          WebDriver::Driver.for(:safari, service: service, **opts)
        end

        def chrome_options(args: [], **opts)
          opts[:browser_version] = 'stable' if WebDriver::Platform.windows?
          opts[:web_socket_url] = true if ENV['WEBDRIVER_BIDI'] && !opts.key?(:web_socket_url)
          opts[:binary] ||= ENV['CHROME_BINARY'] if ENV.key?('CHROME_BINARY')
          args << '--headless=chrome' if ENV['HEADLESS']
          args << '--no-sandbox' unless Platform.windows?
          args << '--disable-gpu'
          WebDriver::Options.chrome(args: args, **opts)
        end

        def edge_options(args: [], **opts)
          opts[:browser_version] = 'stable' if WebDriver::Platform.windows?
          opts[:web_socket_url] = true if ENV['WEBDRIVER_BIDI'] && !opts.key?(:web_socket_url)
          opts[:binary] ||= ENV['EDGE_BINARY'] if ENV.key?('EDGE_BINARY')
          args << '--headless=chrome' if ENV['HEADLESS']
          args << '--no-sandbox' unless Platform.windows?
          args << '--disable-gpu'
          WebDriver::Options.edge(args: args, **opts)
        end

        def firefox_options(args: [], **opts)
          opts[:browser_version] = 'stable' if WebDriver::Platform.windows?
          opts[:web_socket_url] = true if ENV['WEBDRIVER_BIDI'] && !opts.key?(:web_socket_url)
          opts[:binary] ||= ENV['FIREFOX_BINARY'] if ENV.key?('FIREFOX_BINARY')
          args << '--headless' if ENV['HEADLESS']
          WebDriver::Options.firefox(args: args, **opts)
        end

        def ie_options(**opts)
          opts[:require_window_focus] = true
          WebDriver::Options.ie(**opts)
        end

        def safari_preview_options(**opts)
          WebDriver::Safari.technology_preview!
          WebDriver::Options.safari(**opts)
        end

        def random_port
          addr = Socket.getaddrinfo(Platform.localhost, 0, Socket::AF_INET, Socket::SOCK_STREAM)
          addr = Socket.pack_sockaddr_in(0, addr[0][3])
          sock = Socket.new(Socket::AF_INET, Socket::SOCK_STREAM, 0)
          sock.bind(addr)

          sock.local_address.ip_port
        ensure
          sock.close
        end
      end
    end # SpecSupport
  end # WebDriver
end # Selenium
