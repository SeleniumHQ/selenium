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
    module LocalDriver
      def initialize_local_driver(capabilities, options, service, url)
        raise ArgumentError, "Can't initialize #{self.class} with :url" if url

        service ||= Service.send(browser)
        caps = process_options(options, capabilities, service)
        url = service_url(service)

        [caps, url]
      end

      def process_options(options, capabilities, service)
        default_options = Options.send(browser)

        if options && capabilities
          msg = "Don't use both :options and :capabilities when initializing #{self.class}, prefer :options"
          raise ArgumentError, msg
        elsif options && !options.is_a?(default_options.class)
          raise ArgumentError, ":options must be an instance of #{default_options.class}"
        elsif capabilities
          WebDriver.logger.deprecate("The :capabilities parameter for #{self.class}",
                                     ":options argument with an instance of #{self.class}",
                                     id: :capabilities)
          service.executable_path ||= WebDriver::DriverFinder.path(capabilities, service.class)
          generate_capabilities(capabilities)
        else
          options ||= default_options
          service.executable_path ||= WebDriver::DriverFinder.path(options, service.class)
          options.as_json
        end
      end
    end
  end
end
