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
    module EdgeChrome
      describe Driver, only: {driver: :edge_chrome} do
        it 'gets and sets network conditions' do
          driver.network_conditions = {offline: false, latency: 56, throughput: 789}
          expect(driver.network_conditions).to eq(
            'offline' => false,
            'latency' => 56,
            'download_throughput' => 789,
            'upload_throughput' => 789
          )
        end

        it 'sets download path' do
          driver.download_path = File.expand_path(__dir__)
          # there is no simple way to verify that it's now possible to download
          # at least it doesn't crash
        end

        it 'can execute CDP commands' do
          res = driver.execute_cdp('Page.addScriptToEvaluateOnNewDocument', source: 'window.was_here="TW";')
          expect(res).to have_key('identifier')

          begin
            driver.navigate.to url_for('formPage.html')

            tw = driver.execute_script('return window.was_here')
            expect(tw).to eq('TW')
          ensure
            driver.execute_cdp('Page.removeScriptToEvaluateOnNewDocument', identifier: res['identifier'])
          end
        end
      end
    end # EdgeChrome
  end # WebDriver
end # Selenium
