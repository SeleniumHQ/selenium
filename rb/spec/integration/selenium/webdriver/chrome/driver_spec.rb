# encoding: utf-8
#
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
      compliant_on browser: :chrome do
        describe Driver do
          it 'should accept an array of custom command line arguments' do
            begin
              driver = Selenium::WebDriver.for :chrome, args: ['--user-agent=foo;bar']
              driver.navigate.to url_for('click_jacker.html')

              ua = driver.execute_script 'return window.navigator.userAgent'
              expect(ua).to eq('foo;bar')
            ensure
              driver.quit if driver
            end
          end

          it 'should raise ArgumentError if :args is not an Array' do
            expect do
              Selenium::WebDriver.for(:chrome, args: '--foo')
            end.to raise_error(ArgumentError)
          end

          it_behaves_like 'driver that can be started concurrently', :chrome
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
