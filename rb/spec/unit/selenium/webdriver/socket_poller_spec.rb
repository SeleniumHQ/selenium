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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe SocketPoller do
      before(:context) do
        # Open the listening socket synchronously so the server object is captured
        # deterministically (no race with the accept thread) and bind errors surface here.
        @listening_server = TCPServer.new(Platform.localhost, 0)
        @listening_port = @listening_server.addr[1]
        @accept_thread = Thread.new do
          loop { @listening_server.accept.close }
        rescue IOError, Errno::EBADF, Errno::ECONNABORTED
          # listening socket closed during teardown
        end
        @accept_thread.report_on_exception = false

        # Reserve an ephemeral port, then release it so nothing is listening on it.
        closed_server = TCPServer.new(Platform.localhost, 0)
        @closed_port = closed_server.addr[1]
        closed_server.close
      end

      after(:context) do
        @listening_server&.close
        @accept_thread&.kill
      end

      def poller(port)
        SocketPoller.new('localhost', port, 5, 0.05)
      end

      describe '#connected?' do
        it 'returns true when the socket is listening' do
          expect(poller(@listening_port)).to be_connected
        end

        it 'returns false if the socket is not listening after the given timeout' do
          start = Time.parse('2010-01-01 00:00:00')
          wait  = Time.parse('2010-01-01 00:00:04')
          stop  = Time.parse('2010-01-01 00:00:06')

          allow(Process).to receive(:clock_gettime).and_return(start, wait, stop)
          expect(poller(@closed_port)).not_to be_connected
        end
      end

      describe '#closed?' do
        it 'returns true when the socket is closed' do
          expect(poller(@closed_port)).to be_closed
        end

        it 'returns false if the socket is still listening after the given timeout' do
          start = Time.parse('2010-01-01 00:00:00').to_f
          wait  = Time.parse('2010-01-01 00:00:04').to_f
          stop  = Time.parse('2010-01-01 00:00:06').to_f

          allow(Process).to receive(:clock_gettime).and_return(start, wait, stop)
          expect(poller(@listening_port)).not_to be_closed
        end
      end
    end
  end # WebDriver
end # Selenium
