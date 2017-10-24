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
    module PhantomJS

      #
      # Driver implementation for PhantomJS.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::TakesScreenshot

        def initialize(opts = {})
          WebDriver.logger.deprecate 'Selenium support for PhantomJS', 'headless Chrome/Firefox or HTMLUnit'

          opts[:desired_capabilities] ||= Remote::Capabilities.phantomjs

          unless opts.key?(:url)
            driver_path = opts.delete(:driver_path) || PhantomJS.driver_path
            port = opts.delete(:port) || Service::DEFAULT_PORT

            opts[:driver_opts] ||= {}
            if opts.key? :args
              WebDriver.logger.deprecate ':args', "driver_opts: {args: #{opts[:args]}}"
              opts[:driver_opts][:args] = opts.delete(:args)
            elsif opts[:desired_capabilities]['phantomjs.cli.args']
              opts[:driver_opts][:args] = opts[:desired_capabilities]['phantomjs.cli.args']
            end

            @service = Service.new(driver_path, port, opts.delete(:driver_opts))
            @service.start
            opts[:url] = @service.uri
          end

          listener = opts.delete(:listener)
          @bridge = Remote::Bridge.handshake(opts)
          super(@bridge, listener: listener)
        end

        def browser
          :phantomjs
        end

        def quit
          super
        ensure
          @service.stop if @service
        end

      end # Bridge
    end # PhantomJS
  end # WebDriver
end # Selenium
