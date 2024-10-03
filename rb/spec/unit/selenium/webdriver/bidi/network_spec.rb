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
# "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require File.expand_path('../spec_helper', __dir__)
require 'rspec/mocks'

module Selenium
  module WebDriver
    class BiDi
      describe Network do
        let(:network) { instance_double(described_class) }

        it 'adds an intercept with mocked request' do
          allow(network).to receive(:add_intercept)
            .with(phases: [Network::InterceptPhases[:BEFORE_REQUEST]])
            .and_return('intercept' => 'mocked_intercept_id')

          intercept = network.add_intercept(phases: [Network::InterceptPhases[:BEFORE_REQUEST]])
          expect(intercept['intercept']).to eq('mocked_intercept_id')
        end

        it 'removes an intercept with mocked request' do
          allow(network).to receive(:remove_intercept)
            .with('mocked_intercept_id')
            .and_return('status' => 'success')

          intercept = network.remove_intercept('mocked_intercept_id')
          expect(intercept['status']).to eq('success')
        end

        it 'continues with mocked auth' do
          allow(network).to receive(:auth_required).and_return({})

          request_id = 'mock_request_id'
          allow(network).to receive(:continue_with_auth)
            .with(request_id, 'user', 'password')
            .and_return('status' => 'success')

          expect(network.auth_required).to eq({})
          auth_response = network.continue_with_auth(request_id, 'user', 'password')
          expect(auth_response['status']).to eq('success')
        end
      end
    end
  end
end
