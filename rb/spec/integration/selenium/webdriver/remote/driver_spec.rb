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
    module Remote
      describe Driver, exclusive: [{bidi: false, reason: 'Not yet implemented with BiDi'}, {driver: :remote}] do
        it 'exposes session_id' do
          expect(driver.session_id).to be_a(String)
        end

        it 'exposes remote status' do
          expect(driver.status).to be_a(Hash)
        end

        it 'uses a default file detector',
           flaky: {browser: :safari, ci: :github, reason: 'unreliable with downloads'} do
          driver.navigate.to url_for('upload.html')

          driver.find_element(id: 'upload').send_keys(__FILE__)
          driver.find_element(id: 'go').submit
          wait.until { driver.find_element(id: 'upload_label').displayed? }

          driver.switch_to.frame('upload_target')
          wait.until { driver.find_element(xpath: '//body') }

          body = driver.find_element(xpath: '//body')
          expect(body.text.scan('Licensed to the Software Freedom Conservancy').count).to eq(2)
        end

        it 'lists downloads', exclude: {browser: :safari, reason: 'grid hangs'} do
          reset_driver!(enable_downloads: true) do |driver|
            browser_downloads(driver)

            file_names = %w[file_1.txt file_2.jpg]

            expect(driver.downloadable_files).to match_array(file_names)
          end
        end

        it 'downloads a file', exclude: {browser: :safari, reason: 'grid hangs'} do
          target_directory = File.join(Dir.tmpdir.to_s, SecureRandom.uuid)
          at_exit { FileUtils.rm_f(target_directory) }

          reset_driver!(enable_downloads: true) do |driver|
            browser_downloads(driver)

            file_name = 'file_1.txt'
            driver.download_file(file_name, target_directory)

            file_content = File.read("#{target_directory}/#{file_name}").strip
            expect(file_content).to eq('Hello, World!')
          end
        end

        it 'deletes downloadable files', exclude: {browser: :safari, reason: 'grid hangs'} do
          reset_driver!(enable_downloads: true) do |driver|
            browser_downloads(driver)

            driver.delete_downloadable_files

            expect(driver.downloadable_files).to be_empty
          end
        end

        it 'errors when not set', {except: {browser: :firefox, reason: 'grid always sets true and firefox returns it'},
                                   exclude: {browser: :safari, reason: 'grid hangs'}} do
          expect {
            driver.downloadable_files
          }.to raise_exception(Error::WebDriverError,
                               'You must enable downloads in order to work with downloadable files.')
        end

        private

        def browser_downloads(driver)
          driver.navigate.to url_for('downloads/download.html')
          driver.find_element(id: 'file-1').click
          driver.find_element(id: 'file-2').click

          wait.until { driver.downloadable_files.include? 'file_2.jpg' }
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
