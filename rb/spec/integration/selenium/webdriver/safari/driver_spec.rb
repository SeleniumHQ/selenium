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
    module Safari
      describe Driver, exclusive: {browser: %i[safari safari_preview]} do
        it 'gets and sets permissions' do
          driver.permissions = {'getUserMedia' => false}
          expect(driver.permissions).to eq('getUserMedia' => false)
        end

        describe '#technology_preview!' do
          before(:all) { quit_driver }

          after do
            Service.driver_path = nil
            Safari.use_technology_preview = nil
          end

          it 'sets before options', exclusive: {browser: :safari} do
            Safari.technology_preview!
            local_driver = WebDriver.for :safari
            expect(local_driver.capabilities.browser_name).to eq 'Safari Technology Preview'
          end

          it 'sets after options' do
            options = Options.safari
            Safari.technology_preview!
            local_driver = WebDriver.for :safari, options: options
            expect(local_driver.capabilities.browser_name).to eq 'Safari Technology Preview'
          end
        end
      end
    end # Safari
  end # WebDriver
end # Selenium
