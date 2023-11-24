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
      describe KeyInput do
        let(:key_input) { described_class.new(:name) }
        let(:key) { 'a' }
        let(:interaction) { TypingInteraction.new(key_input, :up, 'a') }

        describe '#type' do
          it 'returns :key' do
            expect(key_input.type).to eq(:key)
          end
        end

        describe '#encode' do
          it 'returns nil if no actions' do
            expect(key_input.encode).to be_nil
          end

          it 'encodes each action' do
            allow(interaction).to receive(:encode).and_call_original
            2.times { key_input.add_action(interaction) }

            key_input.encode

            expect(interaction).to have_received(:encode).twice
          end
        end

        describe '#create_key_down' do
          it 'executes #add_action with created interaction' do
            allow(TypingInteraction).to receive(:new).with(key_input, :down, key).and_return(interaction)
            allow(key_input).to receive(:add_action).and_call_original

            key_input.create_key_down(key)

            expect(key_input).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_key_up' do
          it 'executes #add_action with created interaction' do
            allow(TypingInteraction).to receive(:new).with(key_input, :up, key).and_return(interaction)
            allow(key_input).to receive(:add_action).and_call_original

            key_input.create_key_up(key)

            expect(key_input).to have_received(:add_action).with(interaction)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
