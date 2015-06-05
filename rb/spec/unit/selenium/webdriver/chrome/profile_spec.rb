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

require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module Chrome

      describe Profile do
        let(:profile) { Profile.new }
        let(:model) { "/some/path" }
        let(:model_profile) { Profile.new(model) }

        before do
          File.stub(:exist?).with(model).and_return true
          File.stub(:directory?).with(model).and_return true

          Dir.stub(:mktmpdir => "/tmp/some/path")
          FileUtils.stub(:rm_rf)
          FileUtils.stub(:mkdir_p)
          FileUtils.stub(:cp_r)
        end

        it "should set and get preference paths" do
          profile['foo.bar.baz'] = true
          profile['foo.bar.baz'].should == true
        end

        it "reads existing prefs" do
          File.should_receive(:read).with("/some/path/Default/Preferences").
                                     and_return('{"autofill": {"enabled": false}}')

          model_profile['autofill.enabled'].should == false
        end

        it "writes out prefs" do
          File.should_receive(:read).with("/some/path/Default/Preferences").
                                     and_return('{"autofill": {"enabled": false}}')

          model_profile['some.other.pref'] = 123

          mock_io = StringIO.new
          FileUtils.should_receive(:mkdir_p).with("/tmp/some/path/Default")
          File.should_receive(:open).with("/tmp/some/path/Default/Preferences", "w").and_yield(mock_io)

          model_profile.layout_on_disk

          result = WebDriver.json_load(mock_io.string)

          result['autofill']['enabled'].should == false
          result['some']['other']['pref'].should == 123
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

