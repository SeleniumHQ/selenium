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
    module Safari
      # @api private
      class LegacyBridge < Remote::Bridge
        COMMAND_TIMEOUT = 60

        def self.legacy?
          !File.exist?(Safari.driver_path)
        end

        def initialize(opts = {})
          command_timeout = Integer(opts[:timeout] || COMMAND_TIMEOUT)
          safari_options  = opts.delete(:options) || Safari::Options.new(opts)
          capabilities    = merge_capabilities(opts, safari_options)

          @command_id ||= 0

          # TODO: handle safari_opts['cleanSession']
          @server = Server.new(safari_options.port, command_timeout)
          @server.start

          @safari = Browser.new
          @safari.start(prepare_connect_file)

          @server.wait_for_connection

          super(desired_capabilities: capabilities)
        end

        def quit
          super

          @server.stop
          @safari.stop
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        private

        def create_session(desired_capabilities)
          resp = raw_execute :newSession, {}, {desiredCapabilities: desired_capabilities}
          Remote::Capabilities.json_create resp.fetch('value')
        end

        def raw_execute(command, opts = {}, command_hash = nil)
          @command_id += 1

          params = {}
          opts.each do |key, value|
            params[camel_case(key.to_s)] = value
          end

          params.merge!(command_hash) if command_hash

          @server.send(
            origin: 'webdriver',
            type: 'command',
            command: {id: @command_id.to_s, name: command, parameters: params}
          )

          raw = @server.receive
          response = raw.fetch('response')

          status_code = response['status']
          if status_code != 0
            raise Error.for_code(status_code), response['value']['message']
          end

          if raw['id'].to_s != @command_id.to_s
            raise Error::WebDriverError, "response id does not match command id: #{raw['id']} != #{@command_id}"
          end

          response
        end

        def camel_case(str)
          parts = str.split('_')
          parts[1..-1].map(&:capitalize!)

          parts.join
        end

        def prepare_connect_file
          # TODO: use tempfile?
          path = File.join(Dir.tmpdir, "safaridriver-#{Time.now.usec}.html")

          File.open(path, 'w') do |io|
            io << "<!DOCTYPE html><script>window.location = '#{@server.uri}';</script>"
          end

          FileReaper << path
          path.tr! '/', '\\' if Platform.windows?

          path
        end

        def merge_capabilities(opts, safari_options)
          caps  = safari_options.to_capabilities
          other = opts[:desired_capabilities]

          if other
            other = opts[:desired_capabilities].as_json
            caps['safari.options'].merge!(other.delete('safari.options') || {})
            caps.merge!(other)
          end

          caps
        end
      end # Bridge
    end # Safari
  end # WebDriver
end # Selenium
