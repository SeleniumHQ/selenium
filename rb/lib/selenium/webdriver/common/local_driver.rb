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
      def initialize_local_driver(options, service, url, http_client, client_config)
        assert_local_arguments(url, http_client, client_config)

        service ||= Service.send(browser)
        caps = process_options(options, service)
        http_client ||= Remote::Http::Default.new(client_config: client_config)
        http_client.server_url = service_url(service)

        begin
          yield(caps, http_client) if block_given?
        rescue Selenium::WebDriver::Error::WebDriverError
          @service_manager&.stop
          raise
        end
      end

      def service_url(service)
        @service_manager = service.launch
        @service_manager.uri
      end

      def process_options(options, service)
        default_options = Options.send(browser)
        options ||= default_options

        unless options.is_a?(default_options.class)
          raise ArgumentError, ":options must be an instance of #{default_options.class}"
        end

        finder = WebDriver::DriverFinder.new(options, service)
        options.binary = finder.browser_path if options.respond_to?(:binary) && finder.browser_path?
        service.executable_path = finder.driver_path
        options.browser_version = nil if options.respond_to?(:binary) && options.binary
        options.as_json
      end

      private

      def assert_local_arguments(url, http_client, client_config)
        if url || client_config&.server_url
          raise ArgumentError, "Can't set the server URL for #{self.class}; the service provides it"
        elsif http_client && client_config
          raise ArgumentError, 'Cannot use both :http_client and :client_config'
        end
      end
    end
  end
end
