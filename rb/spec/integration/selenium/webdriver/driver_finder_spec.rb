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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe DriverFinder, exclude: {driver: :remote} do
      let(:browser) { GlobalTestEnv.browser }
      let(:options) { WebDriver::Options.send(browser) }
      let(:service) { WebDriver::Service.send(browser) }
      let(:cache_dir) { ENV['SE_CACHE_PATH'] || File.join(Dir.home, '.cache', 'selenium') }
      let(:driver_finder) { described_class.new(options, service) }

      it 'resolves an executable driver path' do
        expect { Platform.assert_executable(driver_finder.driver_path) }.not_to raise_error
      end

      it 'resolves an executable browser path' do
        expect { Platform.assert_executable(driver_finder.browser_path) }.not_to raise_error
      end

      it 'downloads the driver into the Selenium cache',
         except: {browser: %i[safari ie], reason: 'driver ships with OS'} do
        original = ENV.fetch('SE_SKIP_DRIVER_IN_PATH', nil)
        ENV['SE_SKIP_DRIVER_IN_PATH'] = 'true'
        expect(includes_path?(driver_finder.driver_path, cache_dir)).to be(true)
      ensure
        ENV['SE_SKIP_DRIVER_IN_PATH'] = original
      end

      it 'downloads the browser into the Selenium cache',
         except: {browser: %i[safari ie], reason: 'browser ships with OS'} do
        original = ENV.fetch('SE_FORCE_BROWSER_DOWNLOAD', nil)
        ENV['SE_FORCE_BROWSER_DOWNLOAD'] = 'true'
        expect(includes_path?(driver_finder.browser_path, cache_dir)).to be(true)
      ensure
        ENV['SE_FORCE_BROWSER_DOWNLOAD'] = original
      end
    end
  end
end
