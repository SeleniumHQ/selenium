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

require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote

      describe Bridge do
        it "raises ArgumentError if passed invalid options" do
          expect { Bridge.new(:foo => 'bar') }.to raise_error(ArgumentError)
        end

        it "raises WebDriverError if uploading non-files" do
          request_body = WebDriver.json_dump(:sessionId => '11123', :value => {})
          headers = {'Content-Type' => 'application/json'}
          stub_request(:post, "http://127.0.0.1:4444/wd/hub/session").to_return(
            :status => 200, :body => request_body, :headers => headers)

          bridge = Bridge.new
          expect { bridge.upload("NotAFile")}.to raise_error(Error::WebDriverError)
        end

        context 'custom session_id' do
          let(:bridge) { described_class.new session_id: 'session_id' }

          before { allow_any_instance_of(described_class).to receive(:getCapabilities) }

          it 'sets session_id' do
            expect(bridge.session_id).to eq 'session_id'
          end

          it 'retrieves capabilities' do
            expect_any_instance_of(described_class).to receive(:getCapabilities)
            bridge
          end
        end
      end

    end # Remote
  end # WebDriver
end # Selenium

