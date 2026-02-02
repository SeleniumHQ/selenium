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
        Errno::EPIPE, # broken pipe (browser process was killed)
        Errno::EBADF, # file descriptor already closed (double-close or GC)
        IOError, # Ruby socket read/write after close
        EOFError # socket reached EOF after remote closed cleanly
      ].freeze

      RESPONSE_WAIT_TIMEOUT = 30
      RESPONSE_WAIT_INTERVAL = 0.1

      MAX_LOG_MESSAGE_SIZE = 9999

      def initialize(url:)
        @callback_threads = ThreadGroup.new

        @callbacks_mtx = Mutex.new
        @messages_mtx = Mutex.new
        @closing_mtx = Mutex.new

        @closing = false
        @session_id = nil
        @url = url

        process_handshake
        @socket_thread = attach_socket_listener
      end

      def close
        @closing_mtx.synchronize do
          return if @closing

          @closing = true
        end

        begin
          socket.close
        rescue *CONNECTION_ERRORS => e
          WebDriver.logger.debug "WebSocket listener closed: #{e.class}: #{e.message}", id: :ws
          # already closed
        end

        # Let threads unwind instead of calling exit
        @socket_thread&.join(0.5)
        @callback_threads.list.each do |thread|
          thread.join(0.5)
        rescue StandardError => e
          WebDriver.logger.debug "Failed to join thread during close: #{e.class}: #{e.message}", id: :ws
        end
      end

      def callbacks
        @callbacks ||= Hash.new { |callbacks, event| callbacks[event] = [] }
      end

      def add_callback(event, &block)
        @callbacks_mtx.synchronize do
          callbacks[event] << block
          block.object_id
        end
      end

      def remove_callback(event, id)
        @callbacks_mtx.synchronize do
          return if @closing

          callbacks_for_event = callbacks[event]
          return if callbacks_for_event.reject! { |cb| cb.object_id == id }

          ids = callbacks_for_event.map(&:object_id)
          raise Error::WebDriverError, "Callback with ID #{id} does not exist for event #{event}: #{ids}"
        end
      end

      def send_cmd(**payload)
        id = next_id
        data = payload.merge(id: id)
        WebDriver.logger.debug "WebSocket -> #{data}"[...MAX_LOG_MESSAGE_SIZE], id: :ws
        data = JSON.generate(data)
        out_frame = WebSocket::Frame::Outgoing::Client.new(version: ws.version, data: data, type: 'text')

        begin
          socket.write(out_frame.to_s)
        rescue *CONNECTION_ERRORS => e
          raise e, "WebSocket is closed (#{e.class}: #{e.message})"
        end

        wait.until { @messages_mtx.synchronize { messages.delete(id) } }
      end

      private

      def messages
        @messages ||= {}
      end

      def process_handshake
        socket.print(ws.to_s)
        ws << socket.readpartial(1024) until ws.finished?
      end

      def attach_socket_listener
        Thread.new do
          Thread.current.report_on_exception = false

          loop do
            break if @closing

            incoming_frame << socket.readpartial(1024)

            while (frame = incoming_frame.next)
              break if @closing

              message = process_frame(frame)
              next unless message['method']

              @messages_mtx.synchronize { callbacks[message['method']].dup }.each do |callback|
                @callback_threads.add(callback_thread(message['params'], &callback))
              end
            end
          end
        rescue *CONNECTION_ERRORS, WebSocket::Error => e
          WebDriver.logger.debug "WebSocket listener closed: #{e.class}: #{e.message}", id: :ws
        end
      end

      def incoming_frame
        @incoming_frame ||= WebSocket::Frame::Incoming::Client.new(version: ws.version)
      end

      def process_frame(frame)
        message = frame.to_s

        # Firefox will periodically fail on unparsable empty frame
        return {} if message.empty?

        msg = JSON.parse(message)
        @messages_mtx.synchronize { messages[msg['id']] = msg if msg.key?('id') }

        WebDriver.logger.debug "WebSocket <- #{msg}"[...MAX_LOG_MESSAGE_SIZE], id: :ws
        msg
      end

      def callback_thread(params)
        Thread.new do
          Thread.current.abort_on_exception = false
          Thread.current.report_on_exception = false
          next if @closing

          yield params
        rescue Error::WebDriverError, *CONNECTION_ERRORS => e
          WebDriver.logger.debug "Callback aborted: #{e.class}: #{e.message}", id: :ws
        rescue StandardError => e
          next if @closing

          bt = Array(e.backtrace).first(5).join("\n")
          WebDriver.logger.error "Callback error: #{e.class}: #{e.message}\n#{bt}", id: :ws
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
