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
    module Chrome

      #
      # Driver implementation for Chrome.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::HasWebStorage
        include DriverExtensions::TakesScreenshot

        def initialize(opts = {})
          opts[:desired_capabilities] = create_capabilities(opts)

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path) || Chrome.driver_path
            port = opts.delete(:port) || Service::DEFAULT_PORT

            opts[:driver_opts] ||= {}
            if opts.key? :service_log_path
              WebDriver.logger.warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
            [DEPRECATION] `:service_log_path` is deprecated. Use `driver_opts: {log_path: #{opts[:service_log_path]}}`
              DEPRECATE
              opts[:driver_opts][:log_path] = opts.delete :service_log_path
            end

            if opts.key? :service_args
              WebDriver.logger.warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
            [DEPRECATION] `:service_args` is deprecated. Pass switches using `driver_opts`
              DEPRECATE
              opts[:driver_opts][:args] = opts.delete(:service_args)
            end

            @service = Service.new(driver_path, port, opts.delete(:driver_opts))
            @service.start
            opts[:url] = @service.uri
          end

          @bridge = Remote::Bridge.handshake(opts)
          super(@bridge, listener: opts[:listener])
        end

        def browser
          :chrome
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def create_capabilities(opts)
          caps = opts.delete(:desired_capabilities) { Remote::Capabilities.chrome }

          chrome_options = caps['chromeOptions'] || caps[:chrome_options] || {}
          chrome_options['binary'] = Chrome.path if Chrome.path
          args = opts.delete(:args) || opts.delete(:switches) || []

          unless args.is_a? Array
            raise ArgumentError, ':args must be an Array of Strings'
          end

          args.map!(&:to_s)
          profile = opts.delete(:profile).as_json if opts.key?(:profile)

          if profile && args.none? { |arg| arg =~ /user-data-dir/ }
            args << "--user-data-dir=#{profile[:directory]}"
          end
          chrome_options['args'] = args unless args.empty?

          chrome_options['extensions'] = profile[:extensions] if profile && profile[:extensions]
          chrome_options['detach'] = true if opts.delete(:detach)
          chrome_options['prefs'] = opts.delete(:prefs) if opts.key?(:prefs)

          caps[:chrome_options] = chrome_options unless chrome_options.empty?
          caps[:proxy] = opts.delete(:proxy) if opts.key?(:proxy)
          caps[:proxy] ||= opts.delete('proxy') if opts.key?('proxy')

          caps
        end
      end # Driver
    end # Chrome
  end # WebDriver
end # Selenium
