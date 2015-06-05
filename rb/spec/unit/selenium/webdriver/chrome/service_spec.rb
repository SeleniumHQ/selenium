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

      describe Service do
        let(:mock_process) do
          double("ChildProcess", :io => double.as_null_object, :start => true)
        end

        # ugh.
        before { Service.instance_variable_set("@executable_path", nil) }

        it "uses the user-provided path if set" do
          Platform.stub(:os => :unix)
          Platform.stub(:assert_executable).with("/some/path")
          Chrome.driver_path = "/some/path"

          expect(ChildProcess).to receive(:build) do |*args|
            args.first.should == "/some/path"
            mock_process
          end


          Service.default_service
        end

        it "finds the Chrome server binary by searching PATH" do
          Platform.stub(:os => :unix)
          Platform.should_receive(:find_binary).once.and_return("/some/path")
          Platform.should_receive(:assert_executable).with("/some/path")

          Service.executable_path.should == "/some/path"
        end

        it "raises a nice error if the server binary can't be found" do
          Platform.stub(:find_binary).and_return(nil)

          lambda { Service.executable_path }.should raise_error(Error::WebDriverError, /code\.google\.com/)
        end

      end
    end # Chrome
  end # WebDriver
end # Selenium
