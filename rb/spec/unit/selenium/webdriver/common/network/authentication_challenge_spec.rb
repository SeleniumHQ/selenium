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

require File.expand_path('../../spec_helper', __dir__)
require_relative 'network_spec_support'

module Selenium
  module WebDriver
    describe Network::AuthenticationChallenge do
      include NetworkSpecSupport

      let(:challenge) do
        described_class.new(typed('network.authRequired', auth_required(url: 'https://example.com/secure')))
      end

      it 'reads the request that was challenged' do
        expect(challenge).to have_attributes(id: 'request-1', url: 'https://example.com/secure')
      end

      it 'raises when answered a second time, keeping the first answer' do
        challenge.cancel

        expect { challenge.authenticate(username: 'user', password: 'pass') }
          .to raise_error(Error::WebDriverError, /already answered/)
        expect(challenge.answer).to eq(action: :cancel)
      end
    end
  end
end
