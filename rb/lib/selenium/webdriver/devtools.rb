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

      def initialize(url)
        @uri = URI("http://#{url}")
        process_handshake
      end

      def send(method, **params)
        data = JSON.generate(id: next_id, method: method, params: params)

        out_frame = WebSocket::Frame::Outgoing::Client.new(version: ws.version, data: data, type: 'text')
        socket.write(out_frame.to_s)

        in_frame = WebSocket::Frame::Incoming::Client.new(version: ws.version)
        in_frame << socket.readpartial(4096)
        JSON.parse(in_frame.next.to_s)
      end

      private

      def next_id
        @id ||= 0
        @id += 1
      end

      def process_handshake
        socket.write(ws.to_s)
        ws << socket.readpartial(1024)
      end

      def socket
        @socket ||= TCPSocket.new(ws.host, ws.port)
      end

      def ws
        @ws ||= WebSocket::Handshake::Client.new(url: ws_url)
      end

      def ws_url
        @ws_url ||= begin
          urls = JSON.parse(Net::HTTP.get(@uri.hostname, '/json', @uri.port))
          page = urls.find { |u| u['type'] == 'page' }
          page['webSocketDebuggerUrl']
        end
      end

    end # DevTools
  end # WebDriver
end # Selenium
