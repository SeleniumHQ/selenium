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
require File.expand_path('../../../../../lib/selenium/webdriver/bidi/network/credentials', __dir__)

module Selenium
  module WebDriver
    class BiDi
      describe Credentials do
        describe '#initialize' do
          it 'initializes with nil username/password by default' do
            creds = described_class.new
            expect(creds.username).to be_nil
            expect(creds.password).to be_nil
          end

          it 'allows initialization with username and password' do
            creds = described_class.new(username: 'alice', password: 'secret')
            expect(creds.username).to eq('alice')
            expect(creds.password).to eq('secret')
          end
        end

        describe '#username / #password' do
          it 'allows setting and retrieving username' do
            creds = described_class.new
            creds.username = 'bob'
            expect(creds.username).to eq('bob')
          end

          it 'allows setting and retrieving password' do
            creds = described_class.new
            creds.password = 'my_password'
            expect(creds.password).to eq('my_password')
          end
        end

        describe '#as_json' do
          it 'returns nil if username is missing' do
            creds = described_class.new(password: 'secret')
            expect(creds.as_json).to be_nil
          end

          it 'returns nil if password is missing' do
            creds = described_class.new(username: 'alice')
            expect(creds.as_json).to be_nil
          end

          it 'returns a hash of the credentials when both username and password are present' do
            creds = described_class.new(username: 'alice', password: 'secret')
            formatted_creds = creds.as_json

            expect(formatted_creds).to eq(
              type: 'password',
              username: 'alice',
              password: 'secret'
            )
          end
        end
      end
    end
  end
end
