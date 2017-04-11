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
    module Safari
      describe Service do
        let(:resp) { {'sessionId' => 'foo', 'value' => Remote::Capabilities.safari.as_json} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:caps) { Remote::Capabilities.safari }
        let(:http) { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Remote::Capabilities).to receive(:safari).and_return(caps)
          allow_any_instance_of(Service).to receive(:start)
          allow_any_instance_of(Service).to receive(:binary_path)
        end

        it 'does not start driver when receives url' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Driver.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'defaults to desired path and port' do
          expect(Service).to receive(:new).with(Safari.driver_path, Service::DEFAULT_PORT, {}).and_return(service)

          Driver.new(http_client: http)
        end

        it 'accepts a driver path & port' do
          path = '/foo/chromedriver'
          port = '1234'
          expect(Service).to receive(:new).with(path, '1234', {}).and_return(service)

          Driver.new(http_client: http, driver_path: path, port: port)
        end
      end
    end # Safari
  end # WebDriver
end # Selenium
