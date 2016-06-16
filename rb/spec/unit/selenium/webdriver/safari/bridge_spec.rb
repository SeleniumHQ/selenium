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
      describe Bridge do
        let(:server)  { double(Server, receive: response).as_null_object }
        let(:browser) { double(Browser).as_null_object }

        let :response do
          {
            'id' => '1',
            'response' => {
              'sessionId' => 'opaque', 'value' => @default_capabilities,
              'status'    => 0
            }
          }
        end

        before do
          @default_capabilities = Remote::Capabilities.safari.as_json

          allow(Server).to receive(:new).and_return(server)
          allow(Browser).to receive(:new).and_return(browser)
        end

        it 'takes desired capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['foo'] = 'bar'

          expect(server).to receive(:send) do |payload|
            expect(payload[:command][:parameters][:desiredCapabilities]['foo']).to eq('bar')
          end

          Bridge.new(desired_capabilities: custom_caps)
        end

        it 'lets direct arguments take presedence over capabilities' do
          custom_caps = Remote::Capabilities.new
          custom_caps['cleanSession'] = false

          expect(server).to receive(:send) do |payload|
            expect(payload[:command][:parameters][:desiredCapabilities]['safari.options']['cleanSession']).to eq(true)
          end

          Bridge.new(clean_session: true)
        end
      end
    end # Safari
  end # WebDriver
end # Selenium
