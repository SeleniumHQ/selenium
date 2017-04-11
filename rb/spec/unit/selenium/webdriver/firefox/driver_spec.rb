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

require File.expand_path('../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Firefox
      describe Driver do
        let(:bridge) { instance_double(Remote::Bridge).as_null_object }
        let(:launcher) { instance_double(Launcher).as_null_object }
        let(:service) { instance_double(Service).as_null_object }

        before do
          allow(Remote::Bridge).to receive(:new).and_return(bridge)
          allow(Launcher).to receive(:new).and_return(launcher)
          allow(Service).to receive(:new).and_return(service)
        end

        it 'is marionette driver by default' do
          driver = Driver.new
          expect(driver).to be_a(Marionette::Driver)
        end

        it 'is legacy driver when asked for' do
          driver = Driver.new(marionette: false)
          expect(driver).to be_a(Legacy::Driver)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
