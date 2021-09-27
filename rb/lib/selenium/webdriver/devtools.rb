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
      RESPONSE_WAIT_TIMEOUT = 30
      RESPONSE_WAIT_INTERVAL = 0.1

      autoload :ConsoleEvent, 'selenium/webdriver/devtools/console_event'
      autoload :ExceptionEvent, 'selenium/webdriver/devtools/exception_event'
      autoload :MutationEvent, 'selenium/webdriver/devtools/mutation_event'
      autoload :PinnedScript, 'selenium/webdriver/devtools/pinned_script'
      autoload :Request, 'selenium/webdriver/devtools/request'
      autoload :Response, 'selenium/webdriver/devtools/response'

      def initialize(url:)
        @callback_threads = ThreadGroup.new

        @messages = []
        @session_id = nil
        @url = url

        process_handshake
        @socket_thread = attach_socket_listener
        start_session
      end

      def close
        @callback_threads.list.each(&:exit)
        @socket_thread.exit
        socket.close
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
        Thread.new do
          Thread.current.abort_on_exception = true
          Thread.current.report_on_exception = false

          until socket.eof?
            incoming_frame << socket.readpartial(1024)

            while (frame = incoming_frame.next)
              message = process_frame(frame)
              next unless message['method']

              params = message['params']
              callbacks[message['method']].each do |callback|
                @callback_threads.add(callback_thread(params, &callback))
              end
            end
          end
        end
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

      def process_frame(frame)
        message = frame.to_s

        # Firefox will periodically fail on unparsable empty frame
        return {} if message.empty?

        message = JSON.parse(message)
        @messages << message
        WebDriver.logger.debug "DevTools <- #{message}"

        message
      end

      def callback_thread(params)
        Thread.new do
          Thread.current.abort_on_exception = true

          # We might end up blocked forever when we have an error in event.
          # For example, if network interception event raises error,
          # the browser will keep waiting for the request to be proceeded
          # before returning back to the original thread. In this case,
          # we should at least print the error.
          Thread.current.report_on_exception = true

          yield params
        end
      end

      def wait
        @wait ||= Wait.new(timeout: RESPONSE_WAIT_TIMEOUT, interval: RESPONSE_WAIT_INTERVAL)
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
