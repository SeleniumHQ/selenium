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

require 'websocket'

module Selenium
  module WebDriver
    class WebSocketConnection
      CONNECTION_ERRORS = [
        Errno::ECONNRESET, # connection is aborted (browser process was killed)
        Errno::EPIPE # broken pipe (browser process was killed)
      ].freeze

      RESPONSE_WAIT_TIMEOUT = 30
      RESPONSE_WAIT_INTERVAL = 0.1

      MAX_LOG_MESSAGE_SIZE = 9999

      def initialize(url:)
        @callback_threads = ThreadGroup.new

        @session_id = nil
        @url = url

        process_handshake
        @socket_thread = attach_socket_listener
      end

      def close
        @callback_threads.list.each(&:exit)
        @socket_thread.exit
        socket.close
      end

      def callbacks
        @callbacks ||= Hash.new { |callbacks, event| callbacks[event] = [] }
      end

      def send_cmd(**payload)
        id = next_id
        data = payload.merge(id: id)
        WebDriver.logger.debug "WebSocket -> #{data}"[...MAX_LOG_MESSAGE_SIZE]
        data = JSON.generate(data)
        out_frame = WebSocket::Frame::Outgoing::Client.new(version: ws.version, data: data, type: 'text')
        socket.write(out_frame.to_s)

        wait.until { messages.delete(id) }
      end

      private

      # We should be thread-safe to use the hash without synchronization
      # because its keys are WebSocket message identifiers and they should be
      # unique within a devtools session.
      def messages
        @messages ||= {}
      end

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
        rescue *CONNECTION_ERRORS
          Thread.stop
        end
      end

      def incoming_frame
        @incoming_frame ||= WebSocket::Frame::Incoming::Client.new(version: ws.version)
      end

      def process_frame(frame)
        message = frame.to_s

        # Firefox will periodically fail on unparsable empty frame
        return {} if message.empty?

        message = JSON.parse(message)
        messages[message['id']] = message
        WebDriver.logger.debug "WebSocket <- #{message}"[...MAX_LOG_MESSAGE_SIZE]

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
        rescue *CONNECTION_ERRORS
          Thread.stop
        end
      end

      def wait
        @wait ||= Wait.new(timeout: RESPONSE_WAIT_TIMEOUT, interval: RESPONSE_WAIT_INTERVAL)
      end

      def socket
        @socket ||= if URI(@url).scheme == 'wss'
                      socket = TCPSocket.new(ws.host, ws.port)
                      socket = OpenSSL::SSL::SSLSocket.new(socket, OpenSSL::SSL::SSLContext.new)
                      socket.sync_close = true
                      socket.connect

                      socket
                    else
                      TCPSocket.new(ws.host, ws.port)
                    end
      end

      def ws
        @ws ||= WebSocket::Handshake::Client.new(url: @url)
      end

      def next_id
        @id ||= 0
        @id += 1
      end
    end # BiDi
  end # WebDriver
end # Selenium
