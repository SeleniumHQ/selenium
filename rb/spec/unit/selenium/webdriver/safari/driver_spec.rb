# frozen_string_literal: true

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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    module Safari
      describe Driver do
        let(:http)    { instance_double(Remote::Http::Default, call: resp).as_null_object }
        let(:resp)    { {'value' => {'sessionId' => 'foo', 'capabilities' => Remote::Capabilities.safari.as_json}} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:caps)    { Remote::Capabilities.safari }

        before do
          allow(Remote::Capabilities).to receive(:safari).and_return(caps)
          allow(Service).to receive(:binary_path).and_return('/foo')
          allow(Service).to receive(:new).and_return(service)
        end

        it 'accepts server URL' do
          expect(Service).not_to receive(:new)
          expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

          Driver.new(http_client: http, url: 'http://example.com:4321')
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['foo'] = 'bar'

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:capabilities][:firstMatch][0]['foo']).to eq 'bar'
            resp
          end

          Driver.new(http_client: http, desired_capabilities: custom_caps)
        end
      end
    end # Safari
  end # WebDriver
end # Selenium
