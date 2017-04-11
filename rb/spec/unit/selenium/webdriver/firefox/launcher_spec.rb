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
      describe Launcher do
        let(:resp) { {'sessionId' => 'foo', 'value' => Remote::Capabilities.firefox.as_json} }
        let(:launcher) { instance_double(Launcher, launch: true, url: 'http://example.com') }
        let(:caps) { Remote::Capabilities.firefox }
        let(:http) { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:firefox).and_return(caps)
          allow_any_instance_of(Service).to receive(:start)
          allow_any_instance_of(Service).to receive(:binary_path)
        end

        it 'does not start driver when receives url' do
          expect(Launcher).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Driver.new(marionette: false, http_client: http, url: 'http://example.com:4321')
        end

        it 'defaults to desired port' do
          expect(Launcher).to receive(:new).with(anything, DEFAULT_PORT, nil).and_return(launcher)

          Driver.new(marionette: false, http_client: http)
        end

        it 'accepts a driver port' do
          port = '1234'
          expect(Launcher).to receive(:new).with(anything, '1234', nil).and_return(launcher)

          Driver.new(marionette: false, http_client: http, port: port)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
