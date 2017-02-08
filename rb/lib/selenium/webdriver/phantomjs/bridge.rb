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
      class Bridge < Remote::OSSBridge
        def driver_extensions
          [DriverExtensions::TakesScreenshot, DriverExtensions::HasInputDevices]
        end

        private

        def bridge_module
          Module.nesting[1]
        end

        def default_capabilities
          Remote::Capabilities.phantomjs
        end

        def process_deprecations(opts)
          if opts.key?(:args)
            warn <<-DEPRECATE.gsub(/\n +| {2,}/, ' ').freeze
            [DEPRECATION] `:args` is deprecated. Use `:service_args` instead.
            DEPRECATE
            opts[:service_args] = opts.delete :args
          end

          super
        end
      end # Bridge
    end # PhantomJS
  end # WebDriver
end # Selenium
