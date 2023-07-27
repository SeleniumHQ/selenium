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
      let(:results) do
        {'browser_path' => 'browser',
         'driver_path' => 'driver'}
      end

      before do
        allow(Selenium::Manager).to receive(:results).and_return(results)
        allow(Platform).to receive(:assert_executable)
      end

      describe '#path' do
        let(:options) { Options.chrome }
        let(:service) { Chrome::Service }

        it 'uses browser name by default' do
          described_class.path(options, service)

          expect(Selenium::Manager).to have_received(:results).with(%w[--browser chrome])
        end

        it 'uses browser version if specified' do
          options.browser_version = '1'

          described_class.path(options, service)

          expect(Selenium::Manager).to have_received(:results).with(%w[--browser chrome --browser-version 1])
        end

        it 'uses proxy if specified' do
          proxy = Selenium::WebDriver::Proxy.new(ssl: 'proxy')
          options.proxy = proxy

          described_class.path(options, service)

          expect(Selenium::Manager).to have_received(:results).with(%w[--browser chrome --proxy proxy])
        end

        it 'uses browser location if specified' do
          options.binary = '/path/to/browser'

          described_class.path(options, service)

          expect(Selenium::Manager).to have_received(:results)
            .with(%w[--browser chrome --browser-path /path/to/browser])
        end

        it 'properly escapes plain spaces in browser location' do
          options.binary = '/path to/the/browser'

          described_class.path(options, service)

          expect(Selenium::Manager).to have_received(:results)
            .with(['--browser', 'chrome', '--browser-path', '/path to/the/browser'])
        end
      end

      context 'when Chrome' do
        let(:options) { Options.chrome }
        let(:service) { Chrome::Service }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          service.driver_path = 'path'

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'gives documented error if not found by Selenium Manager' do
          allow(Selenium::Manager).to receive(:results).and_raise(Error::WebDriverError)

          expect {
            described_class.path(options, service)
          }.to raise_error(WebDriver::Error::NoSuchDriverError, %r{errors/driver_location})
        end

        it 'sets binary location and removes browser version on options' do
          options.browser_version = 1

          path = described_class.path(options, service)

          expect(path).to eq 'driver'
          expect(options.binary).to eq 'browser'
          expect(options.browser_version).to be_nil
        end
      end

      context 'when Edge' do
        let(:options) { Options.edge }
        let(:service) { Edge::Service }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          service.driver_path = 'path'
          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'sets binary location and removes browser version on options' do
          options.browser_version = 1

          path = described_class.path(options, service)

          expect(path).to eq 'driver'
          expect(options.binary).to eq 'browser'
          expect(options.browser_version).to be_nil
        end
      end

      context 'when Firefox' do
        let(:options) { Options.firefox }
        let(:service) { Firefox::Service }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          service.driver_path = 'path'

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'sets binary location and removes browser version on options' do
          options.browser_version = 1

          path = described_class.path(options, service)

          expect(path).to eq 'driver'
          expect(options.binary).to eq 'browser'
          expect(options.browser_version).to be_nil
        end
      end

      context 'when IE' do
        let(:options) { Options.ie }
        let(:service) { IE::Service }
        let(:driver) { 'IEDriverServer' }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          service.driver_path = 'path'

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'does not set binary location or reset version on options' do
          options.browser_version = '1'

          path = described_class.path(options, service)

          expect(path).to eq 'driver'
          expect(options).not_to respond_to(:binary)
          expect(options.browser_version).to eq '1'
        end
      end

      context 'when Safari' do
        let(:options) { Options.safari }
        let(:service) { Safari::Service }
        let(:driver) { 'safaridriver' }

        after { service.driver_path = nil }

        it 'accepts path set on class as String' do
          service.driver_path = 'path'

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path').exactly(2).times
        end

        it 'accepts path set on class as proc' do
          service.driver_path = proc { 'path' }

          described_class.path(options, service)

          expect(Selenium::Manager).not_to have_received(:results)
          expect(Platform).to have_received(:assert_executable).with('path')
        end

        it 'does not set binary location or reset version on options' do
          options.browser_version = '1'

          path = described_class.path(options, service)

          expect(path).to eq 'driver'
          expect(options).not_to respond_to(:binary)
          expect(options.browser_version).to eq '1'
        end
      end
    end
  end
end
