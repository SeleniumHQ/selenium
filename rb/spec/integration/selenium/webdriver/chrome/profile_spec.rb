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

module Selenium
  module WebDriver
    module Chrome

      describe Profile do
        let(:profile) { Profile.new }

        # Won't work on ChromeDriver 2.0
        #
        # it "launches Chrome with a custom profile" do
        #   profile['autofill.disabled'] = true
        #
        #   begin
        #     driver = WebDriver.for :chrome, :profile => profile
        #   ensure
        #     driver.quit if driver
        #   end
        # end

        it "should be serializable to JSON" do
          profile['foo.boolean'] = true

          new_profile = Profile.from_json(profile.to_json)
          new_profile['foo.boolean'].should be true
        end

        it "adds an extension" do
          ext_path = "/some/path.crx"

          File.should_receive(:file?).with(ext_path).and_return true
          profile.add_extension(ext_path).should == [ext_path]
        end

        it "reads an extension as binary data" do
          ext_path = "/some/path.crx"
          File.should_receive(:file?).with(ext_path).and_return true

          profile.add_extension(ext_path)

          ext_file = double('file')
          File.should_receive(:open).with(ext_path, "rb").and_yield ext_file
          ext_file.should_receive(:read).and_return "test"

          profile.should_receive(:layout_on_disk).and_return "ignored"
          Zipper.should_receive(:zip).and_return "ignored"

          profile.as_json().should == {
            'zip' => "ignored",
            'extensions' => [Base64.strict_encode64("test")]
          }
        end

        it "raises an error if the extension doesn't exist" do
          lambda {
            profile.add_extension("/not/likely/to/exist.crx")
          }.should raise_error
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

