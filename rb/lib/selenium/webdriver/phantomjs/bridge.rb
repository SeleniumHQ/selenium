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
    module PhantomJS
      #
      # @api private
      #

      class Bridge < Remote::Bridge
        def initialize(opts = {})
          port = opts.delete(:port) || Service::DEFAULT_PORT
          opts[:desired_capabilities] ||= Remote::Capabilities.phantomjs

          unless opts.key?(:url)
            args = opts.delete(:args) || opts[:desired_capabilities]['phantomjs.cli.args']
            @service = Service.new(PhantomJS.path, port, *args)
            @service.start
            opts[:url] = @service.uri
          end

          super(opts)
        end

        def browser
          :phantomjs
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.phantomjs
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
