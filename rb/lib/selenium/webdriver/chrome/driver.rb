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

require 'selenium/webdriver/chromium/driver'

module Selenium
  module WebDriver
    module Chrome
      #
      # Driver implementation for Chrome.
      # @api private
      #

      class Driver < Chromium::Driver
        def initialize(capabilities: nil, options: nil, service: nil, url: nil, **opts)
          raise ArgumentError, "Can't initialize #{self.class} with :url" if url

          caps = process_options(options, capabilities)
          url = service_url(service || Service.chrome)
          super(caps: caps, url: url, **opts)
        end

        def browser
          :chrome
        end

        private

        def devtools_address
          "http://#{capabilities['goog:chromeOptions']['debuggerAddress']}"
        end

        def process_options(options, capabilities)
          if options && !options.is_a?(Options)
            raise ArgumentError, ":options must be an instance of #{Options}"
          elsif options.nil? && capabilities.nil?
            options = Options.new
          end

          super(options, capabilities)
        end
      end # Driver
    end # Chrome
  end # WebDriver
end # Selenium
