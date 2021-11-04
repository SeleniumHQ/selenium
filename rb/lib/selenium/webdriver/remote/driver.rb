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
    module Remote

      #
      # Driver implementation for remote server.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::UploadsFiles
        include DriverExtensions::HasSessionId
        include DriverExtensions::HasRemoteStatus

        def initialize(bridge: nil, listener: nil, **opts)
          desired_capabilities = opts[:desired_capabilities]
          if desired_capabilities.is_a?(Symbol)
            unless Remote::Capabilities.respond_to?(desired_capabilities)
              raise Error::WebDriverError, "invalid desired capability: #{desired_capabilities.inspect}"
            end

            opts[:desired_capabilities] = Remote::Capabilities.__send__(desired_capabilities)
          end
          opts[:url] ||= "http://#{Platform.localhost}:4444/wd/hub"
          super
          @bridge.file_detector = ->((filename, *)) { File.exist?(filename) && filename.to_s }
        end

        private

        def devtools_url
          capabilities['se:cdp']
        end

        def devtools_version
          capabilities['se:cdpVersion']&.split('.')&.first ||
            raise(Error::WebDriverError, "DevTools is not supported by the Remote Server")
        end
      end # Driver
    end # Remote
  end # WebDriver
end # Selenium
