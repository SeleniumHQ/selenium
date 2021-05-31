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
    describe TakesScreenshot do
      before do
        driver.navigate.to url_for('xhtmlTest.html')
      end

      let(:element) { driver.find_element(css: '.content') }
      let(:path) { "#{Dir.tmpdir}/test#{SecureRandom.urlsafe_base64}.png" }

      it 'should save' do
        save_screenshots_and_assert(path)
      end

      it 'should warn if extension of provided path is not png' do
        jpg_path = "#{Dir.tmpdir}/test#{SecureRandom.urlsafe_base64}.jpg"
        message = "name used for saved screenshot does not match file type. "\
                  "It should end with .png extension"
        expect(WebDriver.logger).to receive(:warn).with(message, id: :screenshot).twice

        save_screenshots_and_assert(jpg_path)
      end

      it 'should not warn if extension of provided path is png' do
        expect(WebDriver.logger).not_to receive(:warn)

        save_screenshots_and_assert(path)
      end

      it 'should return in the specified format' do
        ss = element.screenshot_as(:png)
        expect(ss).to be_kind_of(String)
        expect(ss.size).to be_positive
      end

      it 'raises an error when given an unknown format' do
        expect { element.screenshot_as(:jpeg) }.to raise_error(WebDriver::Error::UnsupportedOperationError)
      end

      def save_screenshots_and_assert(path)
        save_screenshot_and_assert(driver, path)
        save_screenshot_and_assert(element, path)
      end

      def save_screenshot_and_assert(source, path)
        source.save_screenshot path
        expect(File.exist?(path)).to be true
        expect(File.size(path)).to be_positive
      ensure
        File.delete(path) if File.exist?(path)
      end

      describe 'page size' do
        before do
          driver.navigate.to url_for('printPage.html')
        end

        after do
          File.delete(path) if File.exist?(path)
        end

        it 'takes viewport screenshot by default' do
          screenshot = driver.save_screenshot path
          expect(IO.read(screenshot)[0x10..0x18].unpack('NN').last).to be < 2600
        end

        it 'takes full page screenshot', exclusive: {browser: :firefox} do
          screenshot = driver.save_screenshot path, full_page: true
          expect(IO.read(screenshot)[0x10..0x18].unpack('NN').last).to be > 2600
        end

        it 'does not take full page screenshot', exclude: {browser: :firefox} do
          expect {
            driver.save_screenshot path, full_page: true
          }.to raise_exception(Error::UnsupportedOperationError, /Full Page Screenshots are not supported/)
        end
      end
    end
  end
end
