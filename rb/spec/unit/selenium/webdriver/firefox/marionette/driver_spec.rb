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

require File.expand_path('../../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Firefox
      module Marionette
        describe Driver do
          let(:resp) { {'value' => {'sessionId' => 'foo', 'capabilities' => Remote::Capabilities.firefox.as_json}} }
          let(:http) { instance_double(Remote::Http::Default, call: resp).as_null_object }
          let(:caps) { Remote::Capabilities.firefox }

          before do
            allow(Remote::Capabilities).to receive(:firefox).and_return(caps)
          end

          it 'accepts server URL' do
            expect(Service).not_to receive(:new)
            expect(http).to receive(:server_url=).with(URI.parse('http://example.com:4321'))

            Driver.new(http_client: http, url: 'http://example.com:4321')
          end
        end
      end # Marionette
    end # Firefox
  end # WebDriver
end # Selenium
