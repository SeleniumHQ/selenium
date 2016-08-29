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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe Error do
      it 'should raise an appropriate error' do
        driver.navigate.to url_for('xhtmlTest.html')

        expect do
          driver.find_element(id: 'nonexistant')
        end.to raise_error(WebDriver::Error::NoSuchElementError)
      end

      compliant_on({browser: :ff_legacy},
                   {driver: :remote, browser: :firefox}) do
        it 'should show stack trace information' do
          driver.navigate.to url_for('xhtmlTest.html')

          rescued = false
          ex = nil

          begin
            driver.find_element(id: 'nonexistant')
          rescue => ex
            rescued = true
          end

          expect(rescued).to be true
          expect(ex.backtrace.first).to include('[remote server]')
        end
      end
    end
  end # WebDriver
end # Selenium
