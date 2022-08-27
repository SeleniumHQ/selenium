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

require_relative '../spec_helper'

module Selenium
  module WebDriver
    module Firefox
      describe Driver, exclusive: {browser: :firefox} do
        let(:extension) { '../../../../../../third_party/firebug/favourite_colour-1.1-an+fx.xpi' }

        describe '#print_options' do
          let(:magic_number) { 'JVBER' }

          before { driver.navigate.to url_for('printPage.html') }

          it 'should return base64 for print command' do
            expect(driver.print_page).to include(magic_number)
          end

          it 'should print with orientation' do
            expect(driver.print_page(orientation: 'landscape')).to include(magic_number)
          end

          it 'should print with valid params' do
            expect(driver.print_page(orientation: 'landscape',
                                     page_ranges: ['1-2'],
                                     page: {width: 30})).to include(magic_number)
          end

          it 'should print full page' do
            viewport_width = driver.execute_script("return window.innerWidth;")
            viewport_height = driver.execute_script("return window.innerHeight;")

            path = "#{Dir.tmpdir}/test#{SecureRandom.urlsafe_base64}.png"
            screenshot = driver.save_full_page_screenshot(path)

            if Platform.linux?
              expect(File.read(screenshot)[0x10..0x18].unpack1('NN')).to be >= viewport_width
              expect(File.read(screenshot)[0x10..0x18].unpack('NN').last).to be > viewport_height
            else
              expect(File.read(screenshot)[0x10..0x18].unpack1('NN') / 2).to be >= viewport_width
              expect(File.read(screenshot)[0x10..0x18].unpack('NN').last / 2).to be > viewport_height
            end

          ensure
            FileUtils.rm_rf(path)
          end
        end

        describe '#install_addon' do
          it 'with path as parameter' do
            ext = File.expand_path(extension, __dir__)
            driver.install_addon(ext)
          end

          it 'with temporary as parameter' do
            ext = File.expand_path(extension, __dir__)
            driver.install_addon(ext, true)
          end
        end

        describe '#uninstall_addon' do
          it 'uninstalls based on id' do
            ext = File.expand_path(extension, __dir__)
            id = driver.install_addon(ext)
            driver.uninstall_addon(id)
          end
        end

        it 'can get and set context' do
          options = Options.new(prefs: {'browser.download.dir': 'foo/bar'})
          create_driver!(capabilities: options) do |driver|
            expect(driver.context).to eq 'content'

            driver.context = 'chrome'
            expect(driver.context).to eq 'chrome'

            # This call can not be made when context is set to 'content'
            dir = driver.execute_script("return Services.prefs.getStringPref('browser.download.dir')")
            expect(dir).to eq 'foo/bar'
          end
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
