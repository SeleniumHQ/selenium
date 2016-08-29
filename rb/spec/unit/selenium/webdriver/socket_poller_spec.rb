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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe SocketPoller do
      let(:poller) { Selenium::WebDriver::SocketPoller.new('localhost', 1234, 5, 0.05) }
      let(:socket) { double Socket, close: true }

      def setup_connect(*states)
        # TODO(jari): find a cleaner way to solve the platform-specific collaborators
        if Platform.jruby?
          states.each do |state|
            if state
              expect(TCPSocket).to receive(:new).and_return socket
            else
              expect(TCPSocket).to receive(:new).and_raise Errno::ECONNREFUSED
            end
          end
        else
          allow(Socket).to receive(:new).and_return socket
          states.each do |state|
            expect(socket).to receive(:connect_nonblock)
              .and_raise(state ? Errno::EISCONN.new('connection in progress') : Errno::ECONNREFUSED.new('connection refused'))
          end
        end
      end

      describe '#connected?' do
        it 'returns true when the socket is listening' do
          setup_connect false, true
          expect(poller).to be_connected
        end

        it 'returns false if the socket is not listening after the given timeout' do
          setup_connect false

          start = Time.parse('2010-01-01 00:00:00')
          wait  = Time.parse('2010-01-01 00:00:04')
          stop  = Time.parse('2010-01-01 00:00:06')

          expect(Time).to receive(:now).and_return(start, wait, stop)
          expect(poller).not_to be_connected
        end
      end

      describe '#closed?' do
        it 'returns true when the socket is closed' do
          setup_connect true, true, false

          expect(poller).to be_closed
        end

        it 'returns false if the socket is still listening after the given timeout' do
          setup_connect true

          start = Time.parse('2010-01-01 00:00:00')
          wait  = Time.parse('2010-01-01 00:00:04')
          stop  = Time.parse('2010-01-01 00:00:06')

          # on rbx, we can't add expectations to Time.now since it will be called by the kernel code.
          expect(poller).to receive(:time_now).and_return(start, wait, stop)
          expect(poller).not_to be_closed
        end
      end
    end
  end # WebDriver
end # Selenium
