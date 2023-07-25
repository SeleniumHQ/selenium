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
        def stub_binary(binary)
          allow(File).to receive(:exist?).with(a_string_ending_with(binary)).and_return(true)
          allow(File).to receive(:executable?).with(a_string_ending_with(binary)).and_return(true)
        end

        before do
          described_class.instance_variable_set(:@binary, nil)
        end

        it 'detects Windows' do
          stub_binary('/windows/selenium-manager.exe')
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:windows?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/windows/selenium-manager\.exe$})
        end

        it 'detects Mac' do
          stub_binary('/macos/selenium-manager')
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:windows?).and_return(false)
          allow(Platform).to receive(:mac?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/macos/selenium-manager$})
        end

        it 'detects Linux' do
          stub_binary('/linux/selenium-manager')
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:windows?).and_return(false)
          allow(Platform).to receive(:mac?).and_return(false)
          allow(Platform).to receive(:linux?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/linux/selenium-manager$})
        end

        it 'errors if cannot find' do
          allow(File).to receive(:exist?).with(a_string_including('selenium-manager')).and_return(false)

          expect {
            described_class.send(:binary)
          }.to raise_error(Error::WebDriverError, /Selenium Manager binary located, but not a file/)
        end
      end

      describe 'self.run' do
        it 'errors if a problem with command' do
          expect {
            described_class.send(:run, 'anything')
          }.to raise_error(Error::WebDriverError, /Unsuccessful command executed: /)
        end
      end

      describe 'self.driver_path' do
        it 'determines browser name by default' do
          allow(described_class).to receive(:run).and_return('browser_path' => '', 'driver_path' => '')
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)

          described_class.driver_path(Options.chrome)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome')
        end

        it 'uses browser version if specified' do
          allow(described_class).to receive(:run).and_return('browser_path' => '', 'driver_path' => '')
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(browser_version: 1)

          described_class.driver_path(options)

          expect(described_class).to have_received(:run)
            .with('selenium-manager',
                  '--browser', 'chrome',
                  '--browser-version', 1)
        end

        it 'uses proxy if specified' do
          proxy = Selenium::WebDriver::Proxy.new(ssl: 'proxy')
          allow(described_class).to receive(:run).and_return('browser_path' => '', 'driver_path' => '')
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(proxy: proxy)

          described_class.driver_path(options)

          expect(described_class).to have_received(:run)
            .with('selenium-manager',
                  '--browser', 'chrome',
                  '--proxy', 'proxy')
        end

        it 'uses browser location if specified' do
          allow(described_class).to receive(:run).and_return('browser_path' => '', 'driver_path' => '')
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(binary: '/path/to/browser')

          described_class.driver_path(options)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome', '--browser-path', '/path/to/browser')
        end

        it 'properly escapes plain spaces in browser location' do
          allow(described_class).to receive(:run).and_return('browser_path' => 'a', 'driver_path' => '')
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(binary: '/path to/the/browser')

          described_class.driver_path(options)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome',
                  '--browser-path', '/path to/the/browser')
        end

        it 'sets binary location on options' do
          allow(described_class).to receive(:run).and_return('browser_path' => 'foo', 'driver_path' => '')
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome

          described_class.driver_path(options)
          expect(options.binary).to eq 'foo'
        end
      end
    end
  end # WebDriver
end # Selenium
