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


module Selenium::WebDriver::DriverExtensions
  describe "HasApplicationCache" do

    compliant_on :browser => nil do
      it "gets the app cache status" do
        driver.application_cache.status.should == :uncached

        driver.online = false
        driver.navigate.to url_for("html5Page.html")

        browser.application_cache.status.should == :idle
      end

      it "loads from cache when offline" do
        driver.get url_for("html5Page.html")
        driver.get url_for("formPage.html")

        driver.online = false

        driver.get url_for("html5Page.html")
        driver.title.should == "HTML5"
      end

      it "gets the app cache entries" do
        # dependant on spec above?!

        driver.get url_for("html5Page")

        entries = driver.application_cache.to_a
        entries.size.should > 2

        entries.each do |e|
          case e.url
          when /red\.jpg/
            e.type.value.should == :master
          when /yellow\.jpg/
            e.type.value.should == :explicit
          end
        end
      end
    end

  end
end
