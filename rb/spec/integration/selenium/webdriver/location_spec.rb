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
  describe HasLocation do

    let(:lat) { 40.714353  }
    let(:lon) { -74.005973 }
    let(:alt) { 0.056747   }

    let(:location) {
      Selenium::WebDriver::Location.new lat, lon, alt
    }

    compliant_on :browser => [:iphone, :android] do
      it "can get and set location" do
        driver.manage.timeouts.implicit_wait = 2
        driver.navigate.to url_for("html5Page.html")

        driver.location = location
        loc = driver.location

        loc.latitude.should be_within(0.000001).of(lat)
        loc.longitude.should be_within(0.000001).of(lon)
        loc.altitude.should be_within(0.000001).of(alt)
      end
    end

  end
end
