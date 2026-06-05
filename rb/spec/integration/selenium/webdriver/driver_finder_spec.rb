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

require 'tmpdir'

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe DriverFinder, skip_if: {driver: :remote} do
      let(:browser) { GlobalTestEnv.browser }
      let(:options) { WebDriver::Options.send(browser) }
      let(:service) { WebDriver::Service.send(browser) }
      let(:driver_finder) { described_class.new(options, service) }

      it 'resolves an executable driver path' do
        expect { Platform.assert_executable(driver_finder.driver_path) }.not_to raise_error
      end

      it 'resolves an executable browser path' do
        expect { Platform.assert_executable(driver_finder.browser_path) }.not_to raise_error
      end

      it 'downloads the driver into the Selenium cache',
         pending_if: {browser: :safari, reason: 'driver ships with OS'} do
        Dir.mktmpdir('se-cache') do |cache_dir|
          originals = {'SE_CACHE_PATH' => ENV.fetch('SE_CACHE_PATH', nil),
                       'SE_SKIP_DRIVER_IN_PATH' => ENV.fetch('SE_SKIP_DRIVER_IN_PATH', nil)}
          ENV['SE_CACHE_PATH'] = cache_dir
          ENV['SE_SKIP_DRIVER_IN_PATH'] = 'true'
          # Match by basename so 8.3 short names on Windows don't fail the path comparison.
          expect(driver_finder.driver_path).to include(File.basename(cache_dir))
        ensure
          originals.each { |k, v| ENV[k] = v }
        end
      end

      it 'downloads the browser into the Selenium cache',
         pending_if: [{browser: :safari, reason: 'browser ships with OS'},
                  {browser: :edge, platform: :windows, reason: 'Edge MSI installer always writes to system path'}] do
        Dir.mktmpdir('se-cache') do |cache_dir|
          originals = {'SE_CACHE_PATH' => ENV.fetch('SE_CACHE_PATH', nil),
                       'SE_FORCE_BROWSER_DOWNLOAD' => ENV.fetch('SE_FORCE_BROWSER_DOWNLOAD', nil)}
          ENV['SE_CACHE_PATH'] = cache_dir
          ENV['SE_FORCE_BROWSER_DOWNLOAD'] = 'true'
          # Match by basename so 8.3 short names on Windows don't fail the path comparison.
          expect(driver_finder.browser_path).to include(File.basename(cache_dir))
        ensure
          originals.each { |k, v| ENV[k] = v }
        end
      end

      it 'resolves the browser to its system install location',
         skip_unless: [{browser: :safari},
                     {browser: :edge, platform: :windows}] do
        Dir.mktmpdir('se-cache') do |cache_dir|
          originals = {'SE_CACHE_PATH' => ENV.fetch('SE_CACHE_PATH', nil),
                       'SE_FORCE_BROWSER_DOWNLOAD' => ENV.fetch('SE_FORCE_BROWSER_DOWNLOAD', nil)}
          ENV['SE_CACHE_PATH'] = cache_dir
          ENV['SE_FORCE_BROWSER_DOWNLOAD'] = 'true'
          # Even when asked to force a download, SM returns the OS-managed install.
          expect(driver_finder.browser_path).not_to include(File.basename(cache_dir))
        ensure
          originals.each { |k, v| ENV[k] = v }
        end
      end
    end
  end
end
