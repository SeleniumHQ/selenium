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

require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Options do

      describe 'logs' do
        compliant_on :driver => [:firefox] do
          it 'can fetch available log types' do
            driver.manage.logs.available_types.should == [:browser, :driver]
          end

          it 'can get the browser log' do
            driver.navigate.to url_for("simpleTest.html")

            entries = driver.manage.logs.get(:browser)
            entries.should_not be_empty
            entries.first.should be_kind_of(LogEntry)
          end

          it 'can get the driver log' do
            driver.navigate.to url_for("simpleTest.html")

            entries = driver.manage.logs.get(:driver)
            entries.should_not be_empty
            entries.first.should be_kind_of(LogEntry)
          end
        end
      end

      describe "cookie management" do
        it "should get all" do
          driver.navigate.to url_for("xhtmlTest.html")
          driver.manage.add_cookie :name => "foo", :value => "bar"

          cookies = driver.manage.all_cookies

          expect(cookies.size).to eq(1)
          cookies.first[:name].should == "foo"
          cookies.first[:value].should == "bar"
        end

        it "should delete one" do
          driver.navigate.to url_for("xhtmlTest.html")

          driver.manage.add_cookie :name => "foo", :value => "bar"
          driver.manage.delete_cookie("foo")
        end

        it "should delete all" do
          driver.navigate.to url_for("xhtmlTest.html")

          driver.manage.add_cookie :name => "foo", :value => "bar"
          driver.manage.delete_all_cookies
          driver.manage.all_cookies.should be_empty
        end

        not_compliant_on :browser => [:ie, :android, :iphone, :safari] do
          it "should use DateTime for expires" do
            driver.navigate.to url_for("xhtmlTest.html")

            expected = DateTime.new(2039)
            driver.manage.add_cookie :name => "foo",
                                     :value   => "bar",
                                     :expires => expected

            actual = driver.manage.cookie_named("foo")[:expires]
            actual.should be_kind_of(DateTime)
            actual.should == expected
          end
        end
      end

    end
  end
end
