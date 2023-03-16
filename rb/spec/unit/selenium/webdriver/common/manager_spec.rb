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
      describe 'self.binary' do
        before do
          described_class.instance_variable_set(:@binary, nil)
        end

        it 'detects Windows' do
          allow(File).to receive(:exist?).and_return(true)
          allow(File).to receive(:executable?).and_return(true)
          allow(Platform).to receive(:windows?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/windows/selenium-manager\.exe$})
        end

        it 'detects Mac' do
          allow(File).to receive(:exist?).and_return(true)
          allow(File).to receive(:executable?).and_return(true)
          allow(Platform).to receive(:windows?).and_return(false)
          allow(Platform).to receive(:mac?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/macos/selenium-manager$})
        end

        it 'detects Linux' do
          allow(File).to receive(:exist?).and_return(true)
          allow(File).to receive(:executable?).and_return(true)
          allow(Platform).to receive(:windows?).and_return(false)
          allow(Platform).to receive(:mac?).and_return(false)
          allow(Platform).to receive(:linux?).and_return(true)

          expect(described_class.send(:binary)).to match(%r{/linux/selenium-manager$})
        end

        it 'errors if cannot find' do
          allow(File).to receive(:exist?).and_return(false)

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
        it 'errors if not one of 3 valid drivers' do
          expect {
            described_class.driver_path('something')
          }.to raise_error(Error::WebDriverError, /Unable to locate driver with name/)
        end

        it 'does not use if driver_path provided' do
          allow(described_class).to receive(:driver_path)
          allow(Platform).to receive(:assert_executable).and_return(false)

          WebDriver::Service.chrome(path: 'something')

          expect(described_class).not_to have_received(:driver_path)
        end

        it 'not used if found on PATH' do
          allow(described_class).to receive(:driver_path)
          allow(Platform).to receive(:assert_executable).and_return(false)
          allow(Platform).to receive(:find_binary).and_return('something')

          WebDriver::Service.chrome

          expect(described_class).not_to have_received(:driver_path)
        end

        it 'gives original error if not found' do
          allow(Platform).to receive(:find_binary)
          allow(described_class).to receive(:driver_path)

          expect {
            WebDriver::Service.chrome
          }.to raise_error(WebDriver::Error::WebDriverError, /Unable to find chromedriver. Please download/)
        end
      end
    end
  end # WebDriver
end # Selenium
