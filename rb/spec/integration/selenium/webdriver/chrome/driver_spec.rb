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
        it 'should accept an array of custom command line arguments' do
          create_driver!(args: ['--user-agent=foo;bar']) do |driver|
            driver.navigate.to url_for('click_jacker.html')

            ua = driver.execute_script 'return window.navigator.userAgent'
            expect(ua).to eq('foo;bar')
          end
        end

        it 'should raise ArgumentError if :args is not an Array' do
          expect { create_driver!(args: '--foo') }.to raise_error(ArgumentError, ':args must be an Array of Strings')
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
