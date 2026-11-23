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
    describe Element, skip_unless: {bidi: false, reason: 'Not yet implemented with BiDi'} do
      def uploaded_body_text
        driver.switch_to.frame('upload_target')
        wait.until do
          text = driver.find_element(tag_name: 'body').text
          text unless text.empty?
        rescue Error::StaleElementReferenceError
          nil
        end
      end

      before do
        driver.file_detector = lambda(&:first)
      end

      after { driver.file_detector = nil }

      context 'when uploading one file' do
        it 'uses the provided file detector',
           flaky: {browser: :safari, ci: :github, reason: 'unreliable with downloads'},
           skip_unless: {driver: :remote} do
          driver.navigate.to url_for('upload.html')

          driver.find_element(id: 'upload').send_keys(create_tempfile.path)
          driver.find_element(id: 'go').click
          wait.until { driver.find_element(id: 'upload_label').displayed? }

          expect(uploaded_body_text.scan('This is a dummy test file').count).to eq(1)
        end
      end

      context 'when uploading multiple files' do
        it 'uses the provided file detector',
           flaky: {browser: :safari, ci: :github, reason: 'unreliable with downloads'},
           skip_unless: {driver: :remote} do
          driver.navigate.to url_for('upload_multiple.html')
          file1 = create_tempfile
          file2 = create_tempfile

          driver.find_element(id: 'upload').send_keys("#{file1.path}\n#{file2.path}")
          driver.find_element(id: 'go').click
          wait.until { driver.find_element(id: 'upload_label').displayed? }

          expect(uploaded_body_text.scan('This is a dummy test file').count).to eq(2)
        end
      end
    end
  end # WebDriver
end # Selenium
