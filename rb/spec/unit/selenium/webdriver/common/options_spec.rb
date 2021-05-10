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
    describe Options do
      subject(:options) { Options.new(local_state: {}) }

      before do
        stub_const("#{Options}::BROWSER", 'foo')
        stub_const("#{Options}::CAPABILITIES", {local_state: 'localState'})
      end

      describe '#as_json' do
        it 'does not override options set via symbol name' do
          options.add_option(:local_state, {foo: 'bar'})
          expect(options.as_json).to include('localState' => {'foo' => 'bar'})
        end

        it 'does not override options set via string name' do
          options.add_option('localState', {foo: 'bar'})
          expect(options.as_json).to include('localState' => {'foo' => 'bar'})
        end
      end
    end # Options
  end # WebDriver
end # Selenium
