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

require 'selenium/manager'

module Selenium
  describe Manager do
    describe '#binary' do
      def stub_binary(binary)
        allow(File).to receive(:file?).with(a_string_ending_with(binary)).and_return(true)
        allow(File).to receive(:executable?).with(a_string_ending_with(binary)).and_return(true)
      end

      before do
        described_class.instance_variable_set(:@binary, nil)
      end

      it 'detects Windows' do
        stub_binary('/windows/selenium-manager.exe')
        allow(described_class).to receive(:os).and_return(:windows)

        expect(described_class.send(:binary)).to match(%r{/windows/selenium-manager\.exe$})
      end

      it 'detects Mac' do
        stub_binary('/macos/selenium-manager')
        allow(described_class).to receive(:os).and_return(:macosx)

        expect(described_class.send(:binary)).to match(%r{/macos/selenium-manager$})
      end

      it 'detects Linux' do
        stub_binary('/linux/selenium-manager')
        allow(described_class).to receive(:os).and_return(:linux)

        expect(described_class.send(:binary)).to match(%r{/linux/selenium-manager$})
      end

      it 'errors if cannot find' do
        allow(File).to receive(:exist?).with(a_string_including('selenium-manager')).and_return(false)

        expect {
          described_class.send(:binary)
        }.to raise_error(Manager::Error::PlatformError, /not a file: /)
      end
    end

    describe '#results' do
      it 'calls the other methods' do
        allow(described_class).to receive(:binary).and_return('binary')
        allow(described_class).to receive(:run)

        described_class.results(['anything'])
        expect(described_class).to have_received(:binary)
        expect(described_class).to have_received(:run).with('binary', ['anything'])
      end

      it 'errors if a problem with command' do
        allow(File).to receive(:file?).and_return true

        expect {
          described_class.results(['anything'])
        }.to raise_error(Manager::Error::PlatformError, /not executable: /)
      end
    end
  end
end # Selenium
