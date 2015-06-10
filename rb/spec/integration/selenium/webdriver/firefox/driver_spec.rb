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
    module Firefox

      describe Driver do
        describe ".new" do
          it "should take a Firefox::Profile instance as argument" do
            begin
              profile = Selenium::WebDriver::Firefox::Profile.new
              driver = Selenium::WebDriver.for :firefox, :profile => profile
            ensure
              driver.quit if driver
            end
          end
        end
      end

    end # Firefox
  end # WebDriver
end # Selenium

