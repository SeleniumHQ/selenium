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
        let(:extensions) { '../../../../../../common/extensions/' }

        describe '#print_options' do
          let(:magic_number) { 'JVBER' }

          before { driver.navigate.to url_for('printPage.html') }

          it 'returns base64 for print command' do
            expect(driver.print_page).to include(magic_number)
          end

          it 'prints with orientation' do
            expect(driver.print_page(orientation: 'landscape')).to include(magic_number)
          end

          it 'prints with valid params' do
            expect(driver.print_page(orientation: 'landscape',
                                     page_ranges: ['1-2'],
                                     page: {width: 30})).to include(magic_number)
          end

          it 'prints full page', except: [{ci: :github,
                                           platform: :windows,
                                           reason: 'Some issues with resolution?'},
                                          {platform: :macosx,
                                           headless: true,
                                           reason: 'showing half resolution of what expected'}] do
            viewport_width = driver.execute_script('return window.innerWidth;')
            viewport_height = driver.execute_script('return window.innerHeight;')

            path = "#{Dir.tmpdir}/test#{SecureRandom.urlsafe_base64}.png"
            screenshot = driver.save_full_page_screenshot(path)
            width, height = png_size(screenshot)

            expect(width).to be >= viewport_width
            expect(height).to be > viewport_height
          ensure
            FileUtils.rm_rf(path)
          end
        end

        describe '#install_addon' do
          it 'install and uninstall xpi file' do
            ext = File.expand_path("#{extensions}/webextensions-selenium-example.xpi", __dir__)
            id = driver.install_addon(ext)

            expect(id).to eq 'webextensions-selenium-example@example.com'
            driver.navigate.to url_for('blank.html')

            injected = driver.find_element(id: 'webextensions-selenium-example')
            expect(injected.text).to eq 'Content injected by webextensions-selenium-example'

            driver.uninstall_addon(id)
            driver.navigate.refresh
            expect(driver.find_elements(id: 'webextensions-selenium-example')).to be_empty
          end

          it 'install and uninstall signed zip file' do
            ext = File.expand_path("#{extensions}/webextensions-selenium-example.zip", __dir__)
            id = driver.install_addon(ext)

            expect(id).to eq 'webextensions-selenium-example@example.com'
            driver.navigate.to url_for('blank.html')

            injected = driver.find_element(id: 'webextensions-selenium-example')
            expect(injected.text).to eq 'Content injected by webextensions-selenium-example'

            driver.uninstall_addon(id)
            driver.navigate.refresh
            expect(driver.find_elements(id: 'webextensions-selenium-example')).to be_empty
          end

          it 'install and uninstall unsigned zip file' do
            ext = File.expand_path("#{extensions}/webextensions-selenium-example-unsigned.zip", __dir__)
            id = driver.install_addon(ext, true)

            expect(id).to eq 'webextensions-selenium-example@example.com'
            driver.navigate.to url_for('blank.html')

            injected = driver.find_element(id: 'webextensions-selenium-example')
            expect(injected.text).to eq 'Content injected by webextensions-selenium-example'

            driver.uninstall_addon(id)
            driver.navigate.refresh
            expect(driver.find_elements(id: 'webextensions-selenium-example')).to be_empty
          end

          it 'install and uninstall signed directory', except: {platform: :windows,
                                                                reason: 'signature must be different for windows'} do
            ext = File.expand_path("#{extensions}/webextensions-selenium-example-signed/", __dir__)
            id = driver.install_addon(ext)

            expect(id).to eq 'webextensions-selenium-example@example.com'
            driver.navigate.to url_for('blank.html')

            injected = driver.find_element(id: 'webextensions-selenium-example')
            expect(injected.text).to eq 'Content injected by webextensions-selenium-example'

            driver.uninstall_addon(id)
            driver.navigate.refresh
            expect(driver.find_elements(id: 'webextensions-selenium-example')).to be_empty
          end

          it 'install and uninstall unsigned directory' do
            ext = File.expand_path("#{extensions}/webextensions-selenium-example/", __dir__)
            id = driver.install_addon(ext, true)

            expect(id).to eq 'webextensions-selenium-example@example.com'
            driver.navigate.to url_for('blank.html')

            injected = driver.find_element(id: 'webextensions-selenium-example')
            expect(injected.text).to eq 'Content injected by webextensions-selenium-example'

            driver.uninstall_addon(id)
            driver.navigate.refresh
            expect(driver.find_elements(id: 'webextensions-selenium-example')).to be_empty
          end
        end

        it 'can get and set context' do
          reset_driver!(prefs: {'browser.download.dir': 'foo/bar'}) do |driver|
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
