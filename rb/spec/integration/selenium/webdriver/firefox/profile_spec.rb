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
        let(:options) { Options.new(profile: profile) }

        before { quit_driver }

        def profile_times(profile)
          JSON.parse(File.new("#{profile}/times.json").read)
        end

        describe '#initialize' do
          it 'uses generated profile' do
            profile.startup_url = url_for('simpleTest.html')

            create_driver!(options: options) do |driver|
              expect(driver.current_url).to include('simpleTest.html')
            end
          end

          it 'accepts existing profile by path' do
            # Get the driver to create an "existing" profile for us
            create_driver! do |driver|
              existing_profile = driver.capabilities['moz:profile']
              create_driver!(options: Options.new(profile: Profile.new(existing_profile))) do |driver2|
                current_profile = driver2.capabilities['moz:profile']
                expect(profile_times(current_profile)).to eq profile_times(existing_profile)
              end
            end
          end

          it 'errors when profile path does not exist' do
            expect { Profile.new('/invalid/path') }.to raise_error(Errno::ENOENT)
          end
        end

        describe '#layout_from_disk' do
          it 'creates empty user file by default' do
            path = Profile.new.layout_on_disk
            expect(path).to include('webdriver-profile')
            expect(File.new("#{path}/user.js").read).to be_empty
          end

          it 'uses existing user file when provided' do
            # Get the driver to create an "existing" profile for us
            create_driver! do |driver|
              existing_profile = driver.capabilities['moz:profile']
              path = Profile.new(existing_profile).layout_on_disk
              expect(path).to include('webdriver-rb-profilecopy')
              expect(File.new("#{path}/user.js").read).not_to be_empty
            end
          end
        end

        describe '#from_name' do
          it 'uses specified profile' do
            name, path = Profile.ini.profile_paths.first
            path_times = JSON.parse(File.new("#{path}/times.json").read)

            create_driver!(options: Options.new(profile: Profile.from_name(name))) do |driver|
              profile_dir = driver.capabilities['moz:profile']
              prof_times = JSON.parse(File.new("#{profile_dir}/times.json").read)
              expect(prof_times).to eq path_times
            end
          end
        end

        describe '#[]=' do
          it 'adds preferences' do
            profile['browser.startup.page'] = 1
            profile['browser.startup.homepage'] = url_for('simpleTest.html')

            create_driver!(options: options) do |driver|
              expect(driver.current_url).to include('simpleTest.html')
            end
          end
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
