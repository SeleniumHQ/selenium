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
        include DriverExtensions::HasFileDownloads

        def initialize(capabilities: nil, options: nil, service: nil, url: nil, **)
          raise ArgumentError, "Can not set :service object on #{self.class}" if service

          url ||= "http://#{Platform.localhost}:4444/wd/hub"
          caps = process_options(options, capabilities)
          super(caps: caps, url: url, **)
          @bridge.file_detector = ->((filename, *)) { File.exist?(filename) && filename.to_s }
          command_list = @bridge.command_list
          @bridge.extend(WebDriver::Remote::Features)
          @bridge.add_commands(command_list)
        end

        private

        def devtools_url
          capabilities['se:cdp']
        end

        def devtools_version
          cdp_version = capabilities['se:cdpVersion']&.split('.')&.first
          raise Error::WebDriverError, 'DevTools is not supported by the Remote Server' unless cdp_version

          Integer(cdp_version)
        end

        def process_options(options, capabilities)
          if options && capabilities
            msg = "Don't use both :options and :capabilities when initializing #{self.class}, prefer :options"
            raise ArgumentError, msg
          elsif options.nil? && capabilities.nil?
            raise ArgumentError, "#{self.class} needs :options to be set"
          end
          options ? options.as_json : generate_capabilities(capabilities)
        end

        def generate_capabilities(capabilities)
          Array(capabilities).map { |cap|
            if cap.is_a? Symbol
              cap = WebDriver::Options.send(cap)
            elsif !cap.respond_to? :as_json
              msg = ":capabilities parameter only accepts objects responding to #as_json which #{cap.class} does not"
              raise ArgumentError, msg
            end
            cap.as_json
          }.inject(:merge)
        end
      end # Driver
    end # Remote
  end # WebDriver
end # Selenium
