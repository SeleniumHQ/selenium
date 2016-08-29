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
      describe Bridge do
        let(:launcher) { double(Launcher, launch: nil, url: 'http://localhost:4444/wd/hub') }
        let(:resp) { {'sessionId' => 'foo', 'value' => @default_capabilities} }
        let(:http) { double(Remote::Http::Default, call: resp).as_null_object }
        let(:caps) { Remote::Capabilities.chrome }

        before do
          @default_capabilities = Remote::Capabilities.firefox.as_json
          allow(Remote::Capabilities).to receive(:firefox).and_return(caps)
          allow(Launcher).to receive(:new).and_return(launcher)
        end

        it 'sets the proxy capability' do
          proxy = Proxy.new(http: 'localhost:9090')
          expect(caps).to receive(:proxy=).with proxy

          Bridge.new(http_client: http, proxy: proxy)
        end

        it 'raises ArgumentError if passed invalid options' do
          expect { Bridge.new(foo: 'bar') }.to raise_error(ArgumentError)
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['foo'] = 'bar'

          expect(http).to receive(:call) do |_, _, payload|
            expect(payload[:desiredCapabilities]['foo']).to eq('bar')
            resp
          end

          Bridge.new(http_client: http, desired_capabilities: custom_caps)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
