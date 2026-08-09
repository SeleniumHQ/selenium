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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    describe ServiceManager do
      subject(:manager) { build_manager }

      let(:running) { described_class.instance_variable_get(:@running) }

      # The service itself is never launched; only the bookkeeping around it is under test.
      def build_manager(port: 4444)
        config = instance_double(Service, executable_path: '/path/to/service', port: port,
                                          log: nil, args: [], shutdown_supported: true)
        described_class.new(config).tap do |service_manager|
          allow(service_manager).to receive_messages(socket_lock: yielding_lock, find_free_port: nil,
                                                     start_process: nil, connect_until_stable: nil,
                                                     stop_process: nil)
        end
      end

      def yielding_lock
        instance_double(SocketLock).tap { |lock| allow(lock).to receive(:locked).and_yield }
      end

      after { described_class.stop_running }

      describe '.track' do
        it 'holds a started service so it can be stopped at exit' do
          manager.start

          expect(running).to include(manager)
        end

        it 'registers a single exit hook however many services start' do
          allow(Platform).to receive(:exit_hook)

          2.times { build_manager.start }

          expect(Platform).to have_received(:exit_hook).at_most(:once)
        end
      end

      describe '.untrack' do
        it 'releases a service once it is stopped' do
          manager.start
          manager.stop

          expect(running).not_to include(manager)
        end
      end

      describe '.stop_running' do
        it 'stops a service that is still running' do
          manager.start

          described_class.stop_running

          expect(manager).to have_received(:stop_process)
        end
      end
    end
  end
end
