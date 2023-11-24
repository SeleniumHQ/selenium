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

module Selenium
  module WebDriver
    module Interactions
      describe NoneInput do
        let(:none) { described_class.new(:name) }
        let(:interaction) { Pause.new(none, 1) }

        describe '#type' do
          it 'returns :key' do
            expect(none.type).to eq(:none)
          end
        end

        describe '#encode' do
          it 'returns nil if no actions' do
            expect(none.encode).to be_nil
          end

          it 'encodes each action' do
            allow(none).to receive(:no_actions?).and_return(false)
            allow(interaction).to receive(:encode).and_call_original
            2.times { none.add_action(interaction) }

            none.encode

            expect(interaction).to have_received(:encode).twice
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
