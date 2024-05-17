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
    describe SeleniumManager do
      describe '.binary' do
        before do
          described_class.instance_variable_set(:@binary, nil)
        end

        it 'uses environment variable' do
          allow(Platform).to receive(:assert_executable).with('/path/to/selenium-manager').and_return(true)
          allow(ENV).to receive(:fetch).with('SE_MANAGER_PATH', nil).and_return('/path/to/selenium-manager')

          expect(described_class.send(:binary)).to match(%r{/path/to/selenium-manager})
        end

        it 'detects Windows' do
          allow(Platform).to receive(:assert_executable).with(a_string_ending_with('/windows/selenium-manager.exe'))
                                                        .and_return(true)
          allow(Platform).to receive(:windows?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/windows/selenium-manager\.exe$})
        end

        it 'detects Mac' do
          allow(Platform).to receive(:assert_executable).with(a_string_ending_with('/macos/selenium-manager'))
                                                        .and_return(true)
          allow(Platform).to receive_messages(windows?: false, mac?: true)

          expect(described_class.send(:binary)).to match(%r{/macos/selenium-manager$})
        end

        it 'detects Linux' do
          allow(Platform).to receive(:assert_executable).with(a_string_ending_with('/linux/selenium-manager'))
                                                        .and_return(true)
          allow(Platform).to receive_messages(windows?: false, mac?: false, linux?: true)

          expect(described_class.send(:binary)).to match(%r{/linux/selenium-manager$})
        end

        it 'errors if cannot find' do
          allow(File).to receive(:exist?).with(a_string_including('selenium-manager')).and_return(false)

          expect { described_class.send(:binary) }.to raise_error(Error::WebDriverError, /not a file/)
        end
      end

      describe '.run' do
        it 'returns result if positive exit status' do
          status = instance_double(Process::Status, exitstatus: 0)
          stdout = '{"result": "value", "logs": []}'
          allow(Open3).to receive(:capture3).and_return([stdout, 'stderr', status])

          expect(described_class.send(:run, 'anything')).to eq 'value'
        end

        it 'errors if a problem with command' do
          allow(Open3).to receive(:capture3).and_raise(StandardError)

          expect {
            described_class.send(:run, 'anything')
          }.to raise_error(Error::WebDriverError, /Unsuccessful command executed: \["anything"\]/)
        end

        it 'errors if exit status greater than 0' do
          status = instance_double(Process::Status, exitstatus: 1)
          stdout = '{"result": "value", "logs": []}'
          allow(Open3).to receive(:capture3).and_return([stdout, 'stderr', status])

          msg = /Unsuccessful command executed: \["anything"\] - Code 1\nvalue\nstderr/
          expect {
            described_class.send(:run, 'anything')
          }.to raise_error(Error::WebDriverError, msg)
        end
      end

      describe '.binary_paths' do
        it 'returns exact output from #run' do
          return_map = {}
          allow(described_class).to receive_messages(binary: 'binary', run: return_map)
          expect(described_class.binary_paths('something')).to eq(return_map)
        end
      end
    end
  end # WebDriver
end # Selenium
