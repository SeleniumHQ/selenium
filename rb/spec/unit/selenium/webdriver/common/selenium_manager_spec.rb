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
          allow(Platform).to receive(:windows?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/windows/selenium-manager\.exe$})
        end

        it 'detects Mac' do
          stub_binary('/macos/selenium-manager')
          allow(Platform).to receive(:windows?).and_return(false)
          allow(Platform).to receive(:mac?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/macos/selenium-manager$})
        end

        it 'detects Linux' do
          stub_binary('/linux/selenium-manager')
          allow(Platform).to receive(:windows?).and_return(false)
          allow(Platform).to receive(:mac?).and_return(false)
          allow(Platform).to receive(:linux?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/linux/selenium-manager$})
        end

        it 'errors if cannot find' do
          allow(File).to receive(:exist?).with(a_string_including('selenium-manager')).and_return(false)

          expect {
            described_class.send(:binary)
          }.to raise_error(Error::WebDriverError, /Unable to obtain Selenium Manager/)
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
        it 'errors if not an option' do
          expect {
            expect {
              described_class.driver_path(Remote::Capabilities.new(browser_name: 'chrome'))
            }.to raise_error(ArgumentError, /SeleniumManager requires a WebDriver::Options instance/)
          }.to have_warning(:selenium_manager)
        end

        it 'determines browser name by default' do
          allow(described_class).to receive(:run)
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)

          expect {
            described_class.driver_path(Options.chrome)
          }.to have_warning(:selenium_manager)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome', '--output', 'json')
        end

        it 'uses browser version if specified' do
          allow(described_class).to receive(:run)
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(browser_version: 1)

          expect {
            described_class.driver_path(options)
          }.to have_warning(:selenium_manager)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome', '--output', 'json', '--browser-version', 1)
        end

        it 'uses browser location if specified' do
          allow(described_class).to receive(:run)
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(binary: '/path/to/browser')

          expect {
            described_class.driver_path(options)
          }.to have_warning(:selenium_manager)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome', '--output', 'json', '--browser-path', '/path/to/browser')
        end

        it 'properly escapes plain spaces in browser location' do
          allow(described_class).to receive(:run)
          allow(described_class).to receive(:binary).and_return('selenium-manager')
          allow(Platform).to receive(:assert_executable)
          options = Options.chrome(binary: '/path to/the/browser')

          expect {
            described_class.driver_path(options)
          }.to have_warning(:selenium_manager)

          expect(described_class).to have_received(:run)
            .with('selenium-manager', '--browser', 'chrome', '--output', 'json',
                  '--browser-path', '/path to/the/browser')
        end
      end
    end
  end # WebDriver
end # Selenium
