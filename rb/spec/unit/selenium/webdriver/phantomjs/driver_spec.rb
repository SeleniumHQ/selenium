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
    module PhantomJS
      describe Driver do
        let(:resp)    { {'sessionId' => 'foo', 'value' => Remote::Capabilities.phantomjs.as_json} }
        let(:service) { instance_double(Service, start: true, uri: 'http://example.com') }
        let(:http)    { instance_double(Remote::Http::Default, call: resp).as_null_object }

        before do
          allow(Service).to receive(:binary_path).and_return('/foo')
          allow(Service).to receive(:new).and_return(service)
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new(browser_name: 'foo')

          expect(http).to receive(:call) do |_verb, _post, payload|
            expect(payload[:desiredCapabilities]).to eq(custom_caps)
            resp
          end

          Driver.new(http_client: http, desired_capabilities: custom_caps)
        end
      end
    end # PhantomJS
  end # WebDriver
end # Selenium
