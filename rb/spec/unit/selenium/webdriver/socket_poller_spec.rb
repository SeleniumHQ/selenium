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
        @server_thread = Thread.new do
          server = TCPServer.open(9250)
          Thread.current.thread_variable_set(:server, server)
          loop { server.accept.close }
        end
        @server_thread.report_on_exception = false
      end

      after(:context) do
        @server_thread.thread_variable_get(:server).close
      end

      def poller(port)
        described_class.new('localhost', port, 5, 0.05)
      end

      describe '#connected?' do
        it 'returns true when the socket is listening' do
          expect(poller(9250)).to be_connected
        end

        it 'returns false if the socket is not listening after the given timeout' do
          start = Time.parse('2010-01-01 00:00:00')
          wait  = Time.parse('2010-01-01 00:00:04')
          stop  = Time.parse('2010-01-01 00:00:06')

          expect(Process).to receive(:clock_gettime).and_return(start, wait, stop)
          expect(poller(9251)).not_to be_connected
        end
      end

      describe '#closed?' do
        it 'returns true when the socket is closed' do
          expect(poller(9251)).to be_closed
        end

        it 'returns false if the socket is still listening after the given timeout' do
          start = Time.parse('2010-01-01 00:00:00').to_f
          wait  = Time.parse('2010-01-01 00:00:04').to_f
          stop  = Time.parse('2010-01-01 00:00:06').to_f

          expect(Process).to receive(:clock_gettime).and_return(start, wait, stop)
          expect(poller(9250)).not_to be_closed
        end
      end
    end
  end # WebDriver
end # Selenium
