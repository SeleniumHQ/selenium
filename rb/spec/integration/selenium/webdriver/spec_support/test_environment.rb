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
        REMOTE_DRIVER_ERRORS = [
          Net::ReadTimeout,
          Net::OpenTimeout,
          Errno::ECONNRESET,
          Errno::ECONNREFUSED
        ].freeze

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

        def browser_version
          ENV.fetch('WD_BROWSER_VERSION', 'stable')
        end

        def driver_instance(...)
          @driver_instance || create_driver!(...)
        end

        def reset_driver!(**opts, &block)
          # do not reset if the test was marked skipped
          return if opts.delete(:example)&.metadata&.fetch(:skip, nil)

          quit_driver
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
                   ["-Dwebdriver.chrome.driver=#{rlocation(ENV['CHROMEDRIVER_BINARY'])}"]
                 elsif ENV.key?('MSEDGEDRIVER_BINARY')
                   ["-Dwebdriver.edge.driver=#{rlocation(ENV['MSEDGEDRIVER_BINARY'])}"]
                 elsif ENV.key?('GECKODRIVER_BINARY')
                   ["-Dwebdriver.gecko.driver=#{rlocation(ENV['GECKODRIVER_BINARY'])}"]
                 else
                   %w[--selenium-manager true]
                 end
          args += %w[--enable-managed-downloads true]
          args += version_stereotype_args unless browser_version == 'stable'

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

        def version_stereotype_args
          stereotype = {browserName: w3c_browser_name, browserVersion: browser_version}.to_json
          ['--driver-configuration',
           "display-name=#{browser} #{browser_version}",
           'max-sessions=1',
           "stereotype=#{stereotype}"]
        end

        def w3c_browser_name
          browser == :edge ? 'MicrosoftEdge' : browser.to_s
        end

        def bazel_java
          return unless ENV.key?('WD_BAZEL_JAVA_LOCATION')

          java_path = File.read(File.expand_path(ENV.fetch('WD_BAZEL_JAVA_LOCATION'))).chomp
          rlocation(java_path)
        end

        def rbe?
          Dir.pwd.start_with?('/mnt/engflow')
        end

        def reset_remote_server
          begin
            @remote_server&.stop
          rescue StandardError => e
            WebDriver.logger.warn("Remote server stop failed: #{e.class}: #{e.message}")
          ensure
            @remote_server = nil
          end
          remote_server
        end

        def remote_server?
          @remote_server&.status_ok?
        end

        def ensure_grid
          return if remote_server?

          reset_remote_server.start
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

        def create_driver!(listener: nil, http_client: nil, **, &block)
          check_for_previous_error
          http_client ||= Remote::Http::Default.new(read_timeout: 30)
          @safari_pairing_attempts ||= 0

          method = :"#{driver}_driver"
          opts = {options: build_options(**), listener: listener, http_client: http_client}
          instance = private_methods.include?(method) ? send(method, **opts) : WebDriver::Driver.for(driver, **opts)
          @safari_pairing_attempts = 0
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
          retry if safari_pairing_retry?(e)
          @create_driver_error = e
          @create_driver_error_count += 1
          raise e
        end

        private

        def build_options(**)
          options_method = :"#{browser}_options"
          if private_methods.include?(options_method)
            send(options_method, **)
          else
            WebDriver::Options.send(browser, **)
          end
        end

        def current_env
          {
            browser: browser,
            driver: driver,
            version: browser_version,
            platform: Platform.os,
            ci: Platform.ci,
            rbe: rbe?
          }
        end

        MAX_ERRORS = 4

        # Safari Driver is slow to release previous sessions especially on Grid.
        SAFARI_PAIRING_RETRIES = 5
        SAFARI_PAIRING_INTERVAL = 1

        def safari_pairing_retry?(error)
          msg = 'instance is already paired'
          return false unless browser.to_s.include?('safari') && error.message.to_s.include?(msg)
          return false if @safari_pairing_attempts >= SAFARI_PAIRING_RETRIES

          @safari_pairing_attempts += 1
          WebDriver.logger.warn("Safari pairing busy; retry #{@safari_pairing_attempts}/#{SAFARI_PAIRING_RETRIES}")
          sleep SAFARI_PAIRING_INTERVAL
          true
        end

        class DriverInstantiationError < StandardError
        end

        def check_for_previous_error
          return unless @create_driver_error && @create_driver_error_count >= MAX_ERRORS

          msg = "previous #{@create_driver_error_count} instantiations of driver #{driver.inspect} failed,"
          msg += " not trying again (#{@create_driver_error.message})"

          raise DriverInstantiationError, msg, @create_driver_error.backtrace
        end

        def remote_driver(**)
          attempts = 0
          begin
            attempts += 1
            ensure_grid unless ENV['WD_REMOTE_URL']
            url = ENV.fetch('WD_REMOTE_URL', remote_server.webdriver_url)
            WebDriver::Driver.for(:remote, url: url, **)
          rescue *REMOTE_DRIVER_ERRORS => e
            raise if attempts > 1

            WebDriver.logger.warn("Remote driver failed (#{e.class}: #{e.message}); restarting grid and retrying")
            reset_remote_server.start unless ENV['WD_REMOTE_URL']
            retry
          end
        end

        def chrome_driver(service: nil, **)
          service ||= WebDriver::Service.chrome
          service.args << '--disable-build-check' if ENV['DISABLE_BUILD_CHECK']
          service.args << '--verbose' if WebDriver.logger.debug?
          service.executable_path = rlocation(ENV['CHROMEDRIVER_BINARY']) if ENV.key?('CHROMEDRIVER_BINARY')
          WebDriver::Driver.for(:chrome, service: service, **)
        end

        def edge_driver(service: nil, **)
          service ||= WebDriver::Service.edge
          service.args << '--disable-build-check' if ENV['DISABLE_BUILD_CHECK']
          service.args << '--verbose' if WebDriver.logger.debug?
          service.executable_path = rlocation(ENV['MSEDGEDRIVER_BINARY']) if ENV.key?('MSEDGEDRIVER_BINARY')
          WebDriver::Driver.for(:edge, service: service, **)
        end

        def firefox_driver(service: nil, **)
          service ||= WebDriver::Service.firefox
          service.args.push('--log', 'trace') if WebDriver.logger.debug?
          service.executable_path = rlocation(ENV['GECKODRIVER_BINARY']) if ENV.key?('GECKODRIVER_BINARY')
          WebDriver::Driver.for(:firefox, service: service, **)
        end

        def safari_driver(**)
          service_opts = WebDriver.logger.debug? ? {args: '--diagnose'} : {}
          service = WebDriver::Service.safari(**service_opts)
          WebDriver::Driver.for(:safari, service: service, **)
        end

        def safari_preview_driver(**)
          service_opts = WebDriver.logger.debug? ? {args: '--diagnose'} : {}
          service = WebDriver::Service.safari(**service_opts)
          WebDriver::Driver.for(:safari, service: service, **)
        end

        def chrome_options(args: [], **opts)
          opts[:browser_version] = browser_version unless ENV.key?('CHROME_BINARY')
          opts[:web_socket_url] = true if ENV['WEBDRIVER_BIDI'] && !opts.key?(:web_socket_url)
          opts[:binary] ||= rlocation(ENV['CHROME_BINARY']) if ENV.key?('CHROME_BINARY')
          args << '--headless' if ENV['HEADLESS']
          args << '--no-sandbox' unless Platform.windows?
          args << '--disable-dev-shm-usage' if GlobalTestEnv.rbe?
          opts[:args] = args
          WebDriver::Options.chrome(**opts)
        end

        def edge_options(args: [], **opts)
          opts[:browser_version] = browser_version unless ENV.key?('EDGE_BINARY')
          opts[:web_socket_url] = true if ENV['WEBDRIVER_BIDI'] && !opts.key?(:web_socket_url)
          opts[:binary] ||= rlocation(ENV['EDGE_BINARY']) if ENV.key?('EDGE_BINARY')
          args << '--headless' if ENV['HEADLESS']
          args << '--no-sandbox' unless Platform.windows?
          args << '--disable-dev-shm-usage' if GlobalTestEnv.rbe?
          opts[:args] = args
          WebDriver::Options.edge(**opts)
        end

        def firefox_options(args: [], **opts)
          opts[:browser_version] = browser_version unless ENV.key?('FIREFOX_BINARY')
          opts[:web_socket_url] = true if ENV['WEBDRIVER_BIDI'] && !opts.key?(:web_socket_url)
          opts[:binary] ||= rlocation(ENV['FIREFOX_BINARY']) if ENV.key?('FIREFOX_BINARY')
          opts[:unhandled_prompt_behavior] ||= 'ignore'
          args << '--headless' if ENV['HEADLESS']
          WebDriver::Options.firefox(args: args, **opts)
        end

        def ie_options(**opts)
          opts[:require_window_focus] = true
          WebDriver::Options.ie(**opts)
        end

        def safari_preview_options(**)
          WebDriver::Safari.technology_preview!
          WebDriver::Options.safari(**)
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

        # Resolves a Bazel rootpath to an absolute path using the runfiles tree.
        # $(location) returns rootpath like "external/<repo>/<path>" but Bazel 9
        # runfiles use rlocation paths like "<repo>/<path>" (no "external/" prefix).
        def rlocation(path)
          return path if path.nil? || File.exist?(path)

          runfiles_dir = ENV.fetch('RUNFILES_DIR', nil)
          return path unless runfiles_dir

          rlocation_path = path.sub(%r{^external/}, '')
          resolved = File.join(runfiles_dir, rlocation_path)
          return resolved if File.exist?(resolved)

          path
        end
      end
    end # SpecSupport
  end # WebDriver
end # Selenium
