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
    describe KeyActions do
      let(:keyboard) { Interactions::KeyInput.new('key_input') }
      let(:bridge) { instance_double(Remote::Bridge).as_null_object }
      let(:builder) { Selenium::WebDriver::ActionBuilder.new(bridge, devices: [keyboard]) }
      let(:element) { Selenium::WebDriver::Element.new(bridge, 'element') }
      let(:key) { 'a' }
      let(:keys) { 'abc' }

      describe '#key_input' do
        it 'gets key input by name' do
          expect(builder.send(:key_input, keyboard.name)).to eq keyboard
        end

        it 'raises ArgumentError if no device exists with that name' do
          expect { builder.send(:key_input, 'none') }.to raise_error(ArgumentError)
        end

        it 'gets default key input' do
          expect(builder.send(:key_input)).to eq keyboard
        end

        it 'creates a new default key input if one not defined' do
          action_builder = Selenium::WebDriver::ActionBuilder.new(bridge)
          expect(action_builder.send(:key_input).name).to eq 'keyboard'
        end
      end

      describe '#key_down' do
        it 'gets key_input' do
          allow(builder).to receive(:key_input).and_call_original

          builder.key_down key, device: keyboard.name

          expect(builder).to have_received(:key_input).with(keyboard.name)
        end

        it 'creates key_down' do
          allow(keyboard).to receive(:create_key_down)

          builder.key_down key

          expect(keyboard).to have_received :create_key_down
        end

        it 'clicks provided element first' do
          allow(builder).to receive(:click).and_call_original

          builder.key_down element, key

          expect(keyboard.actions[0]).to be_a(Interactions::Pause)
          expect(keyboard.actions[1]).to be_a(Interactions::Pause)
          expect(keyboard.actions[2]).to be_a(Interactions::Pause)

          expect(builder).to have_received(:click).with(element)
        end

        it 'passes the key input to the #tick method' do
          allow(builder).to receive(:tick)

          builder.key_down key
          expect(builder).to have_received(:tick).with(keyboard)
        end

        it 'returns itself' do
          expect(builder.key_down(key)).to eq(builder)
        end
      end

      describe '#key_up' do
        it 'gets key_input' do
          allow(builder).to receive(:key_input).and_call_original

          builder.key_up key, device: keyboard.name

          expect(builder).to have_received(:key_input).with(keyboard.name)
        end

        it 'clicks provided element first' do
          allow(builder).to receive(:click).and_call_original

          builder.key_up element, key

          expect(keyboard.actions[0]).to be_a(Interactions::Pause)
          expect(keyboard.actions[1]).to be_a(Interactions::Pause)
          expect(keyboard.actions[2]).to be_a(Interactions::Pause)

          expect(builder).to have_received(:click).with(element)
        end

        it 'passes the key input to the #tick method' do
          allow(builder).to receive(:tick)

          builder.key_up key
          expect(builder).to have_received(:tick).with(keyboard)
        end

        it 'returns itself' do
          expect(builder.key_down(key)).to eq(builder)
        end
      end

      describe '#send_keys' do
        it 'clicks provided element first' do
          allow(builder).to receive(:click).and_call_original

          builder.send_keys element, keys

          expect(keyboard.actions[0]).to be_a(Interactions::Pause)
          expect(keyboard.actions[1]).to be_a(Interactions::Pause)
          expect(keyboard.actions[2]).to be_a(Interactions::Pause)

          expect(builder).to have_received(:click).with(element)
        end

        it 'accepts Strings and characters as arguments' do
          allow(keyboard).to receive(:create_key_down).and_call_original
          allow(keyboard).to receive(:create_key_up).and_call_original

          builder.send_keys keys, keys[0], keys[1], keys[2]
          expect(keyboard).to have_received(:create_key_down).exactly(6).times
          expect(keyboard).to have_received(:create_key_up).exactly(6).times
        end

        it 'accepts symbol arguments' do
          allow(keyboard).to receive(:create_key_down).and_call_original
          allow(keyboard).to receive(:create_key_up).and_call_original

          builder.send_keys keys[0], :shift, keys[1], keys[2]
          expect(keyboard).to have_received(:create_key_down).exactly(4).times
          expect(keyboard).to have_received(:create_key_up).exactly(4).times
        end

        it 'pushes things at the same time' do
          allow(keyboard).to receive(:create_key_down).and_call_original
          allow(keyboard).to receive(:create_key_up).and_call_original

          builder.send_keys [keys[0], :shift], keys[1], keys[2]
          expect(keyboard).to have_received(:create_key_down).exactly(4).times
          expect(keyboard).to have_received(:create_key_up).exactly(4).times
        end
      end
    end
  end # WebDriver
end # Selenium
