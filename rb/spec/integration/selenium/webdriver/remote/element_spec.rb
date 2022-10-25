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
    describe Element, exclusive: {driver: :remote} do
      before do
        driver.file_detector = ->(filename) { File.join(__dir__, filename) }
      end

      after do
        driver.file_detector = nil
      end

      context 'when uploading one file' do
        it 'uses the provided file detector' do
          driver.navigate.to url_for('upload.html')

          driver.find_element(id: 'upload').send_keys('element_spec.rb')
          driver.find_element(id: 'go').submit
          wait.until { driver.find_element(id: 'upload_label').displayed? }

          driver.switch_to.frame('upload_target')
          wait.until { driver.find_element(xpath: '//body') }

          body = driver.find_element(xpath: '//body')
          expect(body.text.scan('Licensed to the Software Freedom Conservancy').count).to eq(3)
        end
      end

      context 'when uploading multiple files' do
        it 'uses the provided file detector' do
          driver.navigate.to url_for('upload_multiple.html')

          driver.find_element(id: 'upload').send_keys("driver_spec.rb\nelement_spec.rb")
          driver.find_element(id: 'go').submit
          wait.until { driver.find_element(id: 'upload_label').displayed? }

          driver.switch_to.frame('upload_target')
          wait.until { driver.find_element(xpath: '//body') }

          body = driver.find_element(xpath: '//body')
          expect(body.text.scan('Licensed to the Software Freedom Conservancy').count).to eq(5)
        end
      end
    end
  end # WebDriver
end # Selenium
