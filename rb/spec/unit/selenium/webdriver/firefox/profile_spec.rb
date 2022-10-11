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
      describe Profile, only: {browser: %i[firefox]} do
        let(:profile) { Profile.new }

        def read_generated_prefs(from = nil)
          prof = from || profile
          dir = prof.layout_on_disk

          File.read(File.join(dir, 'user.js'))
        end

        it '#from_name' do
          ini = instance_double(ProfilesIni)
          allow(Profile).to receive(:ini).and_return(ini)
          allow(ini).to receive(:[]).and_return('not nil')
          Profile.from_name('default')

          expect(ini).to have_received(:[]).with('default')
        end

        it 'should set additional preferences' do
          profile['foo.number'] = 123
          profile['foo.boolean'] = true
          profile['foo.string'] = 'bar'

          expect(read_generated_prefs).to include('user_pref("foo.number", 123)',
                                                  'user_pref("foo.boolean", true)',
                                                  'user_pref("foo.string", "bar")')
        end

        it 'should be serializable to JSON' do
          profile['foo.boolean'] = true

          new_profile = Profile.from_json(profile.to_json)
          expect(read_generated_prefs(new_profile)).to include('user_pref("foo.boolean", true)')
        end

        it 'should properly handle escaped characters' do
          profile['foo'] = 'C:\\r\\n'

          expect(read_generated_prefs).to include('user_pref("foo", "C:\\\\r\\\\n");')
        end

        it 'should let the user override some specific prefs' do
          profile['browser.startup.page'] = 'http://example.com'

          expect(read_generated_prefs).to include(%{user_pref("browser.startup.page", "http://example.com")})
        end

        it 'should raise an error if the value given is not a string, number or boolean' do
          expect { profile['foo.bar'] = [] }.to raise_error(TypeError)
        end

        it 'should raise an error if the value is already stringified' do
          expect { profile['foo.bar'] = '"stringified"' }.to raise_error(ArgumentError)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
