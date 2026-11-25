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
    describe PortLock do
      subject(:port_lock) { described_class.new(port, 2) }

      let(:port) { 4444 }
      let(:tmpdir) { Dir.mktmpdir }

      before { allow(Dir).to receive(:tmpdir).and_return(tmpdir) }

      after { FileUtils.remove_entry(tmpdir) }

      it 'yields to the block' do
        expect { |block| port_lock.locked(&block) }.to yield_control
      end

      it 'returns what the block returned' do
        expect(port_lock.locked { :started }).to be(:started)
      end

      it 'releases the lock once the block is done' do
        port_lock.locked { :first }

        expect(described_class.new(port, 2).locked { :second }).to be(:second)
      end

      it 'releases the lock when the block raises' do
        expect { port_lock.locked { raise 'boom' } }.to raise_error('boom')
        expect(described_class.new(port, 2).locked { :second }).to be(:second)
      end

      it 'ignores a neighbouring port being in use' do
        neighbour = TCPServer.new(Platform.localhost, 0)
        busy = described_class.new(neighbour.addr[1], 2)

        expect(busy.locked { :started }).to be(:started)
      ensure
        neighbour&.close
      end

      it 'keeps a second lock on the same port out' do
        expect {
          port_lock.locked { described_class.new(port, 0).locked { :never } }
        }.to raise_error(Error::WebDriverError, /unable to acquire/)
      end

      it 'lets a lock on a different port through' do
        expect(port_lock.locked { described_class.new(port + 1, 0).locked { :other } }).to be(:other)
      end

      it 'gives each user a lock file of their own' do
        allow(Process).to receive(:uid).and_return(1000)

        result = port_lock.locked do
          allow(Process).to receive(:uid).and_return(1001)
          described_class.new(port, 0).locked { :other_user }
        end

        expect(result).to be(:other_user)
      end

      it 'fails without waiting out the timeout when the lock file cannot be opened' do
        allow(Platform).to receive(:windows?).and_return(false)
        allow(File).to receive(:open).and_raise(Errno::EACCES)

        expect { port_lock.locked { :never } }
          .to raise_error(Error::WebDriverError, /unable to open the lock file/)
      end

      it 'retries a lock file Windows will not open while another process holds it' do
        allow(Platform).to receive(:windows?).and_return(true)
        allow(File).to receive(:open).and_raise(Errno::EACCES)

        expect { described_class.new(port, 0).locked { :never } }
          .to raise_error(Error::WebDriverError, /unable to acquire/)
      end

      it 'fails without waiting out the timeout when the lock file cannot be created' do
        allow(File).to receive(:open).and_raise(Errno::EROFS)

        expect { port_lock.locked { :never } }
          .to raise_error(Error::WebDriverError, /unable to create the lock file/)
      end
    end
  end
end
