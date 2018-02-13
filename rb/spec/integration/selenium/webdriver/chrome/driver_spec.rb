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
    module Chrome
      describe Driver, only: {driver: :chrome} do
        it 'accepts an array of custom command line arguments' do
          create_driver!(args: ['--user-agent=foo;bar']) do |driver|
            driver.navigate.to url_for('click_jacker.html')

            ua = driver.execute_script 'return window.navigator.userAgent'
            expect(ua).to eq('foo;bar')
          end
        end

        it 'raises ArgumentError if :args is not an Array' do
          expect { create_driver!(args: '--foo') }.to raise_error(ArgumentError, ':args must be an Array of Strings')
        end

        it 'gets and sets network conditions' do
          driver.network_conditions = {offline: false, latency: 56, throughput: 789}
          expect(driver.network_conditions).to eq(
            'offline' => false,
            'latency' => 56,
            'download_throughput' => 789,
            'upload_throughput' => 789
          )
        end

        context "DevTools communication" do
          it 'can send commands to DevTools' do
            driver.send_devtools_command('Page.navigate', url: url_for('blank.html'))
            expect(driver.title).to eq('blank')
            driver.send_devtools_command('Page.navigate', url: url_for('colorPage.html'))
            expect(driver.title).to eq('Color Page')
          end

          describe('#set_download_path') do
            let(:download_path) { Dir.mktmpdir }
            let(:file_to_download) { "blank.html" }
            let(:final_path_to_downloaded_file) { download_path + "/" + file_to_download }
            let(:page_to_download_from) do
              'data:text/html,'\
              '<!DOCTYPE html>'\
                '<div>'\
                  '<a download="" href="' + url_for(file_to_download) + '">Go!</a>'\
                '</div>'\
              '</html>'
            end

            before(:each) do
              File.delete(final_path_to_downloaded_file) if File.exist?(final_path_to_downloaded_file)
            end

            it 'can download files in headless mode' do
              options = Selenium::WebDriver::Chrome::Options.new
              options.headless!
              local_driver = WebDriver::Driver.for(:chrome, options: options)
              local_driver.download_path = download_path
              local_driver.get(page_to_download_from)

              local_driver.find_element(css: 'a').click

              sleep 3
              local_driver.quit
              expect(File).to exist(final_path_to_downloaded_file)
            end

            it 'can download files in non-headless mode' do
              driver.download_path = download_path
              driver.get(page_to_download_from)

              driver.find_element(css: 'a').click

              sleep 3
              expect(File).to exist(final_path_to_downloaded_file)
            end
          end
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
