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
      # @api private
      class Bridge < Remote::Bridge
        def initialize(opts = {})
          port = opts.delete(:port) || Service::DEFAULT_PORT
          service_args = opts.delete(:service_args) || {}

          if opts[:service_log_path]
            service_args.merge!(service_log_path: opts.delete(:service_log_path))
          end

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path) || Chrome.driver_path(false)
            @service = Service.new(driver_path, port, *extract_service_args(service_args))
            @service.start
            opts[:url] = @service.uri
          end

          opts[:desired_capabilities] = create_capabilities(opts)

          super(opts)
        end

        def browser
          :chrome
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices,
            DriverExtensions::HasWebStorage
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.chrome
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

          chrome_options['args'] = args.map(&:to_s)
          profile = opts.delete(:profile).as_json if opts.key?(:profile)

          if profile && chrome_options['args'].none? { |arg| arg =~ /user-data-dir/}
            chrome_options['args'] << "--user-data-dir=#{profile[:directory]}"
          end

          chrome_options['extensions'] = profile[:extensions] if profile && profile[:extensions]
          chrome_options['detach'] = true if opts.delete(:detach)
          chrome_options['prefs'] = opts.delete(:prefs) if opts.key?(:prefs)

          caps[:chrome_options] = chrome_options
          caps[:proxy] = opts.delete(:proxy) if opts.key?(:proxy)
          caps[:proxy] ||= opts.delete('proxy') if opts.key?('proxy')

          caps
        end

        def extract_service_args(args)
          service_args = []
          service_args << "--log-path=#{args.delete(:service_log_path)}" if args.key?(:service_log_path)
          service_args << "--url-base=#{args.delete(:url_base)}" if args.key?(:url_base)
          service_args << "--port-server=#{args.delete(:port_server)}" if args.key?(:port_server)
          service_args << "--whitelisted-ips=#{args.delete(:whitelisted_ips)}" if args.key?(:whitelisted_ips)
          service_args << "--verbose=#{args.delete(:verbose)}" if args.key?(:verbose)
          service_args << "--silent=#{args.delete(:silent)}" if args.key?(:silent)
          service_args
        end
      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
