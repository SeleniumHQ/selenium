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
    class DevTools
      autoload :ConsoleEvent, 'selenium/webdriver/devtools/console_event'
      autoload :ExceptionEvent, 'selenium/webdriver/devtools/exception_event'
      autoload :MutationEvent, 'selenium/webdriver/devtools/mutation_event'
      autoload :PinnedScript, 'selenium/webdriver/devtools/pinned_script'
      autoload :Request, 'selenium/webdriver/devtools/request'

      def initialize(url:)
        @messages = []
        @session_id = nil
        @url = url

        process_handshake
        attach_socket_listener
        start_session
      end

      def callbacks
        @callbacks ||= Hash.new { |callbacks, event| callbacks[event] = [] }
      end

      def send_cmd(method, **params)
        id = next_id
        data = {id: id, method: method, params: params.reject { |_, v| v.nil? }}
        data[:sessionId] = @session_id if @session_id
        data = JSON.generate(data)
        WebDriver.logger.debug "DevTools -> #{data}"

        out_frame = WebSocket::Frame::Outgoing::Client.new(version: ws.version, data: data, type: 'text')
        socket.write(out_frame.to_s)

        message = wait.until do
          @messages.find { |m| m['id'] == id }
        end

        raise Error::WebDriverError, error_message(message['error']) if message['error']

        message
      end

      def method_missing(method, *_args)
        desired_class = "Selenium::DevTools::V#{Selenium::DevTools.version}::#{method.capitalize}"
        return unless Object.const_defined?(desired_class)

        self.class.class_eval do
          define_method(method) do
            Object.const_get(desired_class).new(self)
          end
        end

        send(method)
      end

      def respond_to_missing?(method, *_args)
        desired_class = "Selenium::DevTools::V#{Selenium::DevTools.version}::#{method.capitalize}"
        Object.const_defined?(desired_class)
      end

      private

      def process_handshake
        socket.print(ws.to_s)
        ws << socket.readpartial(1024)
      end

      def attach_socket_listener
        socket_listener = Thread.new do
          until socket.eof?
            incoming_frame << socket.readpartial(1024)

            while (frame = incoming_frame.next)
              # Firefox will periodically fail on unparsable empty frame
              break if frame.to_s.empty?

              message = JSON.parse(frame.to_s)
              @messages << message
              WebDriver.logger.debug "DevTools <- #{message}"
              next unless message['method']

              callbacks[message['method']].each do |callback|
                params = message['params'] # take in current thread!
                Thread.new { callback.call(params) }
              end
            end
          end
        end
        socket_listener.abort_on_exception = true
      end

      def start_session
        targets = target.get_targets.dig('result', 'targetInfos')
        page_target = targets.find { |target| target['type'] == 'page' }
        session = target.attach_to_target(target_id: page_target['targetId'], flatten: true)
        @session_id = session.dig('result', 'sessionId')
      end

      def incoming_frame
        @incoming_frame ||= WebSocket::Frame::Incoming::Client.new(version: ws.version)
      end

      def wait
        @wait ||= Wait.new(timeout: 10, interval: 0.1)
      end

      def socket
        @socket ||= TCPSocket.new(ws.host, ws.port)
      end

      def ws
        @ws ||= WebSocket::Handshake::Client.new(url: @url)
      end

      def next_id
        @id ||= 0
        @id += 1
      end

      def error_message(error)
        [error['code'], error['message'], error['data']].join(': ')
      end

    end # DevTools
  end # WebDriver
end # Selenium
