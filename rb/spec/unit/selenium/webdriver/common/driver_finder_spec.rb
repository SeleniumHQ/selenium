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
    describe DriverFinder do
      context 'when Chrome' do
        let(:options) { Options.chrome }
        let(:service) { Chrome::Service }
        let(:driver) { 'chromedriver' }

        after { Chrome::Service.driver_path = nil }

        it 'accepts path set on class as String' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = 'path'
          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'gives original error if not found by Selenium Manager' do
          allow(SeleniumManager).to receive(:driver_path).and_raise(Error::WebDriverError)

          expect {
            described_class.path(options, service)
          }.to raise_error(WebDriver::Error::NoSuchDriverError, %r{errors/driver_location})
        end
      end

      context 'when Edge' do
        let(:options) { Options.edge }
        let(:service) { Edge::Service }
        let(:driver) { 'msedgedriver' }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = 'path'
          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'gives original error if not found by Selenium Manager' do
          allow(SeleniumManager).to receive(:driver_path).and_raise(Error::WebDriverError)

          expect {
            described_class.path(options, service)
          }.to raise_error(WebDriver::Error::NoSuchDriverError, %r{errors/driver_location})
        end
      end

      context 'when Firefox' do
        let(:options) { Options.firefox }
        let(:service) { Firefox::Service }
        let(:driver) { 'geckodriver' }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = 'path'
          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'gives original error if not found by Selenium Manager' do
          allow(SeleniumManager).to receive(:driver_path).and_raise(Error::WebDriverError)

          expect {
            described_class.path(options, service)
          }.to raise_error(WebDriver::Error::NoSuchDriverError, %r{errors/driver_location})
        end
      end

      context 'when IE' do
        let(:options) { Options.ie }
        let(:service) { IE::Service }
        let(:driver) { 'IEDriverServer' }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = 'path'
          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'gives original error if not found by Selenium Manager' do
          allow(SeleniumManager).to receive(:driver_path).and_raise(Error::WebDriverError)

          expect {
            described_class.path(options, service)
          }.to raise_error(WebDriver::Error::NoSuchDriverError, %r{errors/driver_location})
        end
      end

      context 'when Safari' do
        let(:options) { Options.safari }
        let(:service) { Safari::Service }
        let(:driver) { 'safaridriver' }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = 'path'
          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          allow(SeleniumManager).to receive(:driver_path)
          allow(Platform).to receive(:assert_file)
          allow(Platform).to receive(:assert_executable)

          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(SeleniumManager).not_to have_received(:driver_path)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'gives original error if not found by Selenium Manager' do
          allow(SeleniumManager).to receive(:driver_path).and_raise(Error::WebDriverError)

          expect {
            described_class.path(options, service)
          }.to raise_error(WebDriver::Error::NoSuchDriverError, %r{errors/driver_location})
        end
      end
    end
  end
end
