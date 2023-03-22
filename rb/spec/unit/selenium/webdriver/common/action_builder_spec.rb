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
    describe ActionBuilder do
      let(:keyboard) { Interactions.key('key') }
      let(:mouse) { Interactions.pointer(:mouse, name: 'mouse') }
      let(:bridge) { instance_double(Remote::Bridge).as_null_object }
      let(:builder) { described_class.new(bridge, devices: [mouse, keyboard]) }
      let(:async_builder) { described_class.new(bridge, devices: [mouse, keyboard], async: true) }

      describe '#initialize' do
        it 'does not create input devices when not provided' do
          action_builder = described_class.new(bridge)
          expect(action_builder.devices).to be_empty
        end

        it 'accepts mouse and keyboard with devices keyword' do
          action_builder = described_class.new(bridge, devices: [mouse, keyboard])
          expect(action_builder.devices).to eq([mouse, keyboard])
        end

        it 'accepts multiple devices with devices keyword' do
          none = Interactions.none('none')
          touch = Interactions.pointer(:touch, name: 'touch')
          action_builder = described_class.new(bridge, devices: [mouse, keyboard, none, touch])

          expect(action_builder.devices).to eq([mouse, keyboard, none, touch])
        end

        it 'accepts duration' do
          action_builder = described_class.new(bridge, duration: 2200)
          expect(action_builder.default_move_duration).to eq(2.2)
        end

        it 'raises a TypeError if a non InputDevice is passed into devices' do
          expect {
            described_class.new(bridge, devices: [mouse, keyboard, 'banana'])
          }.to raise_error(TypeError)
        end
      end

      describe '#devices' do
        it 'returns Array of devices' do
          expect(builder.devices).to include(a_kind_of(Interactions::KeyInput),
                                             a_kind_of(Interactions::PointerInput))
        end
      end

      describe '#add_pointer_input' do
        let(:device) { Interactions.pointer :mouse }

        it 'creates pointer and adds to devices' do
          device = builder.add_pointer_input(:touch, 'name')

          expect(builder.devices).to include(device)
        end

        it 'adds pauses to match other devices when sync' do
          builder.key_down('d', device: 'key')
          builder.key_up('d', device: 'key')

          allow(Interactions).to receive(:pointer).and_return(device)
          allow(device).to receive(:name)
          allow(device).to receive(:create_pause)

          builder.add_pointer_input(:touch, 'name')
          expect(device).to have_received(:create_pause).twice
        end

        it 'does not add pauses to match other devices when async' do
          async_builder.key_down('d', device: 'key')
          async_builder.key_up('d', device: 'key')

          allow(Interactions).to receive(:pointer).and_return(device)
          allow(device).to receive(:name)
          allow(device).to receive(:create_pause)

          async_builder.add_pointer_input(:touch, 'name')
          expect(device).not_to have_received(:create_pause)
        end
      end

      describe '#add_key_input' do
        let(:device) { Interactions.key }

        it 'creates keyboard and adds to devices' do
          device = builder.add_key_input('name')

          expect(builder.devices).to include(device)
        end

        it 'adds pauses to match other devices' do
          builder.key_down('d', device: 'key')
          builder.key_up('d', device: 'key')

          allow(Interactions).to receive(:key).and_return(device)
          allow(device).to receive(:create_pause)

          builder.add_key_input('name')
          expect(device).to have_received(:create_pause).twice
        end
      end

      describe '#device' do
        it 'gets device by name' do
          expect(builder.device(name: 'mouse')).to eq(mouse)
        end

        it 'raises ArgumentError when name not found' do
          expect { builder.device(name: 'none', type: Interactions::NONE) }.to raise_error(ArgumentError)
        end

        it 'gets device by type' do
          expect(builder.device(type: Interactions::POINTER)).to eq(mouse)
        end

        it 'returns nil when type not found' do
          expect(builder.device(type: Interactions::NONE)).to be_nil
        end
      end

      describe '#pointer_inputs' do
        it 'returns only pointer inputs' do
          touch_input = builder.add_pointer_input(:touch, 'touch')
          pen_input = builder.add_pointer_input(:pen, 'pen')
          builder.add_key_input('key2')

          expect(builder.pointer_inputs).to eq([mouse, touch_input, pen_input])
        end
      end

      describe '#key_inputs' do
        it 'returns only key inputs' do
          builder.add_pointer_input(:touch, 'touch')
          builder.add_pointer_input(:pen, 'pen')
          key_input = builder.add_key_input('key2')

          expect(builder.key_inputs).to eq([keyboard, key_input])
        end
      end

      describe '#pause' do
        it 'creates pause with default duration' do
          allow(mouse).to receive :create_pause

          builder.pause(device: mouse)

          expect(mouse).to have_received(:create_pause).with(0)
        end

        it 'creates pause with provided duration' do
          allow(mouse).to receive :create_pause

          builder.pause(device: mouse, duration: 5)

          expect(mouse).to have_received(:create_pause).with(5)
        end
      end

      describe '#pauses' do
        it 'adds 2 pauses to a pointer device by default' do
          allow(mouse).to receive :create_pause

          builder.pauses

          expect(mouse).to have_received(:create_pause).with(0).exactly(2).times
        end

        it 'adds multiple pause commands' do
          allow(mouse).to receive :create_pause

          builder.pauses(device: mouse, number: 3)

          expect(mouse).to have_received(:create_pause).with(0).exactly(3).times
        end
      end

      describe '#perform' do
        it 'encodes each device' do
          allow(mouse).to receive(:encode)
          allow(keyboard).to receive(:encode)

          builder.perform

          expect(keyboard).to have_received(:encode)
          expect(mouse).to have_received(:encode)
        end

        it 'clears all actions' do
          allow(builder).to receive(:clear_all_actions)

          builder.perform

          expect(builder).to have_received(:clear_all_actions)
        end

        it 'sends non-nil encoded actions to bridge' do
          allow(mouse).to receive(:encode).and_return(nil)
          allow(keyboard).to receive(:encode).and_return(keyboard: 'encoded')
          allow(bridge).to receive(:send_actions)

          builder.perform
          expect(bridge).to have_received(:send_actions).with([{keyboard: 'encoded'}])
        end
      end

      describe '#clear_all_actions' do
        it 'sends clear_actions to each devices' do
          allow(mouse).to receive(:clear_actions)
          allow(keyboard).to receive(:clear_actions)

          builder.clear_all_actions

          expect(mouse).to have_received(:clear_actions)
          expect(keyboard).to have_received(:clear_actions)
        end
      end

      describe '#release_actions' do
        it 'sends release actions command to bridge' do
          allow(bridge).to receive(:release_actions)

          builder.release_actions

          expect(bridge).to have_received(:release_actions)
        end
      end

      describe 'tick' do
        it 'adds pauses to non-active devices when synchronous' do
          touch = builder.add_pointer_input(:touch, 'touch')
          allow(mouse).to receive(:create_pause)
          allow(touch).to receive(:create_pause)
          allow(keyboard).to receive(:create_pause)

          builder.pointer_down(:left, device: 'mouse')

          expect(mouse).not_to have_received(:create_pause)
          expect(touch).to have_received(:create_pause)
          expect(keyboard).to have_received(:create_pause)
        end

        it 'does not create pauses for any devices when asynchronous' do
          touch = builder.add_pointer_input(:touch, 'touch')
          allow(mouse).to receive(:create_pause)
          allow(touch).to receive(:create_pause)
          allow(keyboard).to receive(:create_pause)

          async_builder.pointer_down(:left, device: 'mouse')

          expect(mouse).not_to have_received(:create_pause)
          expect(touch).not_to have_received(:create_pause)
          expect(keyboard).not_to have_received(:create_pause)
        end
      end
    end # ActionBuilder
  end # WebDriver
end # Selenium
