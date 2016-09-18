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
    module Firefox
      # @api private
      class W3CBridge < Remote::W3CBridge
        def initialize(opts = {})
          port = opts.delete(:port) || Service::DEFAULT_PORT
          opts[:desired_capabilities] = create_capabilities(opts)
          service_args = opts.delete(:service_args) || {}

          @service = Service.new(Firefox.driver_path, port, *extract_service_args(service_args))
          @service.start
          opts[:url] = @service.uri

          super(opts)
        end

        def browser
          :firefox
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices,
            DriverExtensions::HasWebStorage
          ]
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

        private

        def create_capabilities(opts)
          caps = opts.delete(:desired_capabilities) || Remote::W3CCapabilities.firefox
          firefox_options_caps = caps[:firefox_options] || {}
          caps[:firefox_options] = firefox_options_caps.merge(opts[:firefox_options] || {})

          Binary.path = caps[:firefox_options][:binary] if caps[:firefox_options].key?(:binary)
          caps
        end

        def extract_service_args(args = {})
          service_args = []
          service_args << "--binary=#{args[:binary]}" if args.key?(:binary)
          service_args << "–-log=#{args[:log]}" if args.key?(:log)
          service_args << "–-marionette-port=#{args[:marionette_port]}" if args.key?(:marionette_port)
          service_args << "–-host=#{args[:host]}" if args.key?(:host)
          service_args << "–-port=#{args[:port]}" if args.key?(:port)
          service_args
        end

      end # W3CBridge
    end # Firefox
  end # WebDriver
end # Selenium
