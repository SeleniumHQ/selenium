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
  describe HasNetworkConnection do
    compliant_on :browser => :android do
      it "can return the network connection type" do
        expect(driver.network_connection_type).to eq :all
      end

      it "can set the network connection type" do
        expect { driver.network_connection_type = :airplane_mode }.to change { driver.network_connection_type }.from(:all).to(:airplane_mode)
      end
    end
  end
end
