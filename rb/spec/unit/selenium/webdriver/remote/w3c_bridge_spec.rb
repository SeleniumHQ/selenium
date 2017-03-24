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
    module Remote
      describe W3CBridge do
        describe '#create_session' do
          it 'supports responses with "value" capabilities' do
            http_client = WebDriver::Remote::Http::Default.new
            allow(http_client).to receive(:request).and_return('value' => {'sessionId' => true, 'value' => {}})

            bridge = W3CBridge.new(http_client: http_client)
            expect { bridge.create_session({}) }.not_to raise_error
          end

          it 'supports responses with "capabilities" capabilities' do
            http_client = WebDriver::Remote::Http::Default.new
            allow(http_client).to receive(:request).and_return('value' => {'sessionId' => true, 'capabilities' => {}})

            bridge = W3CBridge.new(http_client: http_client)
            expect { bridge.create_session({}) }.not_to raise_error
          end
        end
      end # W3CBridge
    end # Remote
  end # WebDriver
end # Selenium
