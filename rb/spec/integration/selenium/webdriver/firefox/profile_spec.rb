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
    module Firefox
      describe Profile, exclusive: {browser: :firefox} do
        let(:profile) { Profile.new }

        def read_generated_prefs(from = nil)
          prof = from || profile
          dir = prof.layout_on_disk

          File.read(File.join(dir, 'user.js'))
        end

        before do
          quit_driver
          sleep 2
          profile['browser.startup.homepage'] = url_for('simpleTest.html')
          profile['browser.startup.page'] = 1
        end

        it 'should instantiate the browser with the correct profile' do
          create_driver!(capabilities: Options.new(profile: profile)) do |driver|
            expect { wait(5).until { driver.find_element(id: 'oneline') } }.not_to raise_error
          end
        end

        it 'should be able to use the same profile more than once' do
          create_driver!(capabilities: Options.new(profile: profile)) do |driver1|
            expect { wait(5).until { driver1.find_element(id: 'oneline') } }.not_to raise_error
            create_driver!(capabilities: Options.new(profile: profile)) do |driver2|
              expect { wait(5).until { driver2.find_element(id: 'oneline') } }.not_to raise_error
            end
          end
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
