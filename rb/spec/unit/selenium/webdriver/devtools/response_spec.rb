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
    class DevTools
      describe Response do
        describe '.from' do
          it 'sets the headers correctly' do
            params = {'responseHeaders' => [{'name' => 'Connection', 'value' => 'Keep-Alive'}]}
            response = described_class.from(1, nil, params)
            expect(response.headers).to eq({'Connection' => 'Keep-Alive'})
          end

          it 'does not raise error on empty responseHeaders' do
            expect { described_class.from(1, nil, {}) }.not_to raise_error
          end
        end
      end # Response
    end # DevTools
  end # WebDriver
end # Selenium
