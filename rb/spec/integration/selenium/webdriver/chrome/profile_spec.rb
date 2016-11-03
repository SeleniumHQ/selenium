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
        describe Profile do
          let(:profile) { Profile.new }

          it 'can be manually verified without mocks' do
            # Example for command line in mac to create a new data directory
            # /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/path/to/data
            # directory = File.expand_path('../', __FILE__)
            # profile = Profile.new(directory)
            profile = Profile.new
            profile['browser.show_home_button'] = true
            file = File.expand_path('../sample.crx', __FILE__)
            profile.add_extension(file)

            driver = Selenium::WebDriver.for :chrome, profile: profile
            driver.navigate.to url_for('xhtmlTest.html')
            expect('verify manually - home button displayed')
            expect('verify manually - make page red extension properly installed')
            driver.quit
          end

          it 'adds an extension' do
            ext_path = '/some/path.crx'

            expect(File).to receive(:file?).with(ext_path).and_return true
            expect(profile.add_extension(ext_path)).to eq([ext_path])
          end

          it 'reads an extension as binary data' do
            ext_path = '/some/path.crx'
            expect(File).to receive(:file?).with(ext_path).and_return true

            profile.add_extension(ext_path)

            ext_file = double('file')
            expect(File).to receive(:open).with(ext_path, 'rb').and_yield ext_file
            expect(ext_file).to receive(:read).and_return 'test'

            expect(profile).to receive(:layout_on_disk).and_return 'ignored'

            expect(profile.as_json).to eq(directory: 'ignored',
                                          extensions: [Base64.strict_encode64('test')])
          end

          it "raises an error if the extension doesn't exist" do
            expect do
              profile.add_extension('/not/likely/to/exist.crx')
            end.to raise_error(Selenium::WebDriver::Error::WebDriverError)
          end
        end
      end
    end # Chrome
  end # WebDriver
end # Selenium
