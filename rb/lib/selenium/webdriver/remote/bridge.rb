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
      class Bridge
        include Atoms
        include BridgeHelper

        PORT = 4444
        COMMANDS = {
          new_session: [:post, 'session'.freeze]
        }.freeze

        attr_accessor :context, :http, :file_detector
        attr_reader :capabilities, :dialect

        #
        # Implements protocol handshake which:
        #
        #   1. Creates session with driver.
        #   2. Sniffs response.
        #   3. Based on the response, understands which dialect we should use.
        #
        # @return [OSS:Bridge, W3C::Bridge]
        #
        def self.handshake(**opts)
          desired_capabilities = opts.delete(:desired_capabilities) { Capabilities.new }

          if desired_capabilities.is_a?(Symbol)
            unless Capabilities.respond_to?(desired_capabilities)
              raise Error::WebDriverError, "invalid desired capability: #{desired_capabilities.inspect}"
            end
            desired_capabilities = Capabilities.__send__(desired_capabilities)
          end

          bridge = new(opts)
          capabilities = bridge.create_session(desired_capabilities)

          case bridge.dialect
          when :oss
            Remote::OSS::Bridge.new(capabilities, bridge.session_id, opts)
          when :w3c
            Remote::W3C::Bridge.new(capabilities, bridge.session_id, opts)
          else
            raise WebDriverError, 'cannot understand dialect'
          end
        end

        #
        # Initializes the bridge with the given server URL
        # @param [Hash] opts options for the driver
        # @option opts [String] :url url for the remote server
        # @option opts [Object] :http_client an HTTP client instance that implements the same protocol as Http::Default
        # @option opts [Capabilities] :desired_capabilities an instance of Remote::Capabilities describing the capabilities you want
        # @api private
        #

        def initialize(opts = {})
          opts = opts.dup
          http_client = opts.delete(:http_client) { Http::Default.new }
          url = opts.delete(:url) { "http://#{Platform.localhost}:#{PORT}/wd/hub" }

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          uri = url.is_a?(URI) ? url : URI.parse(url)
          uri.path += '/' unless uri.path =~ %r{\/$}

          http_client.server_url = uri

          @http = http_client
          @file_detector = nil
        end

        #
        # Creates session handling both OSS and W3C dialects.
        #

        def create_session(desired_capabilities)
          response = execute(:new_session, {}, merged_capabilities(desired_capabilities))

          @session_id = response['sessionId']
          oss_status = response['status']
          value = response['value']

          if value.is_a?(Hash)
            @session_id = value['sessionId'] if value.key?('sessionId')

            if value.key?('capabilities')
              value = value['capabilities']
            elsif value.key?('value')
              value = value['value']
            end
          end

          unless @session_id
            raise Error::WebDriverError, 'no sessionId in returned payload'
          end

          if oss_status
            WebDriver.logger.info 'Detected OSS dialect.'
            @dialect = :oss
            Capabilities.json_create(value)
          else
            WebDriver.logger.info 'Detected W3C dialect.'
            @dialect = :w3c
            W3C::Capabilities.json_create(value)
          end
        end

        #
        # Returns the current session ID.
        #

        def session_id
          @session_id || raise(Error::WebDriverError, 'no current session exists')
        end

        def browser
          @browser ||= begin
            name = @capabilities.browser_name
            name ? name.tr(' ', '_').to_sym : 'unknown'
          end
        end

        private

        #
        # executes a command on the remote server.
        #
        # @return [WebDriver::Remote::Response]
        #

        def execute(command, opts = {}, command_hash = nil)
          verb, path = commands(command) || raise(ArgumentError, "unknown command: #{command.inspect}")
          path = path.dup

          path[':session_id'] = session_id if path.include?(':session_id')

          begin
            opts.each { |key, value| path[key.inspect] = escaper.escape(value.to_s) }
          rescue IndexError
            raise ArgumentError, "#{opts.inspect} invalid for #{command.inspect}"
          end

          WebDriver.logger.info("-> #{verb.to_s.upcase} #{path}")
          http.call(verb, path, command_hash)
        end

        def escaper
          @escaper ||= defined?(URI::Parser) ? URI::DEFAULT_PARSER : URI
        end

        def commands(command)
          raise NotImplementedError unless command == :new_session
          COMMANDS[command]
        end

        def merged_capabilities(oss_capabilities)
          w3c_capabilities = W3C::Capabilities.from_oss(oss_capabilities)

          {
            desiredCapabilities: oss_capabilities,
            capabilities: {
              firstMatch: [w3c_capabilities]
            }
          }
        end

      end # Bridge
    end # Remote
  end # WebDriver
end # Selenium
