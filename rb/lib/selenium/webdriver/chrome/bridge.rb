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
          http_client = opts.delete(:http_client)

          if opts.key?(:url)
            url = opts.delete(:url)
          else
            @service = Service.new(Chrome.driver_path, Service::DEFAULT_PORT, *extract_service_args(opts))
            @service.start

            url = @service.uri
          end

          caps = create_capabilities(opts)

          remote_opts = {
            url: url,
            desired_capabilities: caps
          }

          remote_opts[:http_client] = http_client if http_client

          super(remote_opts)
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
          caps    = opts.delete(:desired_capabilities) { Remote::Capabilities.chrome }
          args    = opts.delete(:args) || []
          profile = opts.delete(:profile)
          detach  = opts.delete(:detach)
          proxy   = opts.delete(:proxy)
          prefs   = opts.delete(:prefs)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          chrome_options = caps['chromeOptions'] || {}

          unless args.is_a? Array
            raise ArgumentError, ':args must be an Array of Strings'
          end
          chrome_options['args'] = args.map(&:to_s)
          profile = profile.as_json if profile
          if profile && chrome_options['args'].none? { |arg| arg =~ /user-data-dir/}
            chrome_options['args'] << "--user-data-dir=#{profile[:directory]}"
          end
          chrome_options['extensions'] = profile[:extensions] if profile && profile[:extensions]
          chrome_options['binary']     = Chrome.path if Chrome.path
          chrome_options['detach']     = true if detach
          chrome_options['prefs']      = prefs if prefs

          caps['chromeOptions'] = chrome_options
          caps['proxy'] = proxy if proxy

          caps
        end

        def extract_service_args(opts)
          args = []
          args << "--log-path=#{opts.delete(:service_log_path)}" if opts.key?(:service_log_path)
          args
        end
      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
