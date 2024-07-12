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
      it 'class path accepts a String without calling Selenium Manager' do
        allow(Chrome::Service).to receive(:driver_path).and_return('path')
        allow(SeleniumManager).to receive(:binary_paths)
        allow(Platform).to receive(:assert_executable).with('path').and_return(true)

        described_class.new(Options.chrome, Service.chrome).driver_path

        expect(SeleniumManager).not_to have_received(:binary_paths)
        expect(Platform).to have_received(:assert_executable).with('path')
      end

      it 'class path accepts a proc without calling Selenium Manager' do
        allow(Chrome::Service).to receive(:driver_path).and_return(proc { 'path' })
        allow(SeleniumManager).to receive(:binary_paths)
        allow(Platform).to receive(:assert_executable).with('path').and_return(true)

        described_class.new(Options.chrome, Service.chrome).driver_path

        expect(SeleniumManager).not_to have_received(:binary_paths)
        expect(Platform).to have_received(:assert_executable).with('path')
      end

      it 'validates all returned files' do
        allow(SeleniumManager).to receive(:binary_paths).and_return({'browser_path' => '/path/to/browser',
                                                                     'driver_path' => '/path/to/driver'})
        allow(Platform).to receive(:assert_executable).with('/path/to/browser').and_return(true)
        allow(Platform).to receive(:assert_executable).with('/path/to/driver').and_return(true)

        described_class.new(Options.chrome, Service.chrome).driver_path

        expect(Platform).to have_received(:assert_executable).with('/path/to/browser')
        expect(Platform).to have_received(:assert_executable).with('/path/to/driver')
      end

      it 'wraps error with NoSuchDriverError' do
        allow(SeleniumManager).to receive(:binary_paths).and_raise(Error::WebDriverError, 'this error')

        expect {
          expect {
            described_class.new(Options.chrome, Service.chrome).driver_path
          }.to output(/Exception occurred: this error/).to_stderr_from_any_process
        }.to raise_error(WebDriver::Error::NoSuchDriverError, /driver_location/)
      end

      it 'creates arguments' do
        allow(SeleniumManager).to receive(:binary_paths).and_return({'browser_path' => '/path/to/browser',
                                                                     'driver_path' => '/path/to/driver'})
        proxy = instance_double(Proxy, ssl: 'proxy')
        options = Options.chrome(browser_version: 'stable', proxy: proxy, binary: 'path/to/browser')
        allow(Platform).to receive(:assert_executable).with('/path/to/browser').and_return(true)
        allow(Platform).to receive(:assert_executable).with('/path/to/driver').and_return(true)

        described_class.new(options, Service.chrome).driver_path

        expect(SeleniumManager).to have_received(:binary_paths).with('--browser',
                                                                     options.browser_name,
                                                                     '--browser-version',
                                                                     options.browser_version,
                                                                     '--browser-path',
                                                                     options.binary,
                                                                     '--proxy',
                                                                     options.proxy.ssl)
      end
    end
  end
end
