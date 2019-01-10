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
      let(:keyboard) do
        instance_double(Interactions::KeyInput,
                        actions: [1, 2, 3],
                        name: 'keyboard',
                        type: Interactions::KEY)
      end
      let(:mouse) do
        instance_double(Interactions::PointerInput,
                        actions: [1, 2, 3],
                        name: 'mouse',
                        type: Interactions::POINTER)
      end
      let(:bridge) { instance_double('Bridge').as_null_object }
      let(:builder) { ActionBuilder.new(bridge, mouse, keyboard) }
      let(:async_builder) { ActionBuilder.new(bridge, mouse, keyboard, true) }

      context 'when adding an input device' do
        let(:pointer_input) { Interactions.pointer(:touch, name: 'touch') }

        it 'should be able to add an input device' do
          expect { async_builder.send('add_input', pointer_input) }.to change { async_builder.devices.length }.by(1)
        end

        it 'should add pauses to match the device with the most actions when synchronous' do
          expect(builder).to receive(:pauses).with(pointer_input, 3)

          builder.send('add_input', pointer_input)
        end
      end # when adding an input device

      context 'when adding a pointer input' do
        it 'should add a PointerInput' do
          expect(Interactions::PointerInput).to receive(:new).with(:touch, name: 'touch').and_return(:device)
          expect(builder).to receive(:add_input).with(:device)

          expect(builder.add_pointer_input(:touch, 'touch')).to eq(:device)
        end

        it 'should not assign the pointer input as primary if not primary' do
          expect(builder).to receive(:add_input)
          expect(builder).not_to receive(:set_primary_pointer)

          builder.add_pointer_input(:touch, 'touch')
        end
      end # when adding a pointer input

      it 'should add a key input' do
        expect(Interactions::KeyInput).to receive(:new).with('keyboard').and_return(:device)
        expect(builder).to receive(:add_input).with(:device)

        expect(builder.add_key_input('keyboard')).to eq(:device)
      end

      it 'should get a device by name' do
        expect(builder.get_device('mouse')).to eq(mouse)
      end

      it 'should return only pointer inputs' do
        expect(builder.pointer_inputs).to eq([mouse])
      end

      it 'should return the key inputs' do
        expect(builder.key_inputs).to eq([keyboard])
      end

      it 'should create a pause for the given device' do
        duration = 5
        expect(mouse).to receive(:create_pause).with(duration)

        builder.pause(mouse, 5)
      end

      it 'should create multiple pauses for the given device' do
        duration = 5
        number = 3
        expect(mouse).to receive(:create_pause).with(duration).exactly(number).times

        builder.pauses(mouse, number, duration)
      end

      context 'when performing actions' do
        it 'should encode each device' do
          expect(mouse).to receive(:encode)
          expect(keyboard).to receive(:encode)
          allow(builder).to receive(:clear_all_actions)

          builder.perform
        end

        it 'should call bridge#send_actions with encoded and compacted devices' do
          expect(mouse).to receive(:encode).and_return(nil)
          expect(keyboard).to receive(:encode).and_return('not_nil')
          expect(bridge).to receive(:send_actions).with(['not_nil'])
          allow(builder).to receive(:clear_all_actions)

          builder.perform
        end

        it 'should clear all actions' do
          allow(mouse).to receive(:encode)
          allow(keyboard).to receive(:encode)
          expect(builder).to receive(:clear_all_actions)

          builder.perform
        end
      end # when performing actions

      it 'should clear all actions from devices' do
        expect(mouse).to receive(:clear_actions)
        expect(keyboard).to receive(:clear_actions)

        builder.clear_all_actions
      end

      it 'should release actions' do
        expect(bridge).to receive(:release_actions)

        builder.release_actions
      end

      context 'when adding a tick' do
        it 'should not create pauses for any devices when asynchronous' do
          expect(mouse).not_to receive(:create_pause)
          expect(keyboard).not_to receive(:create_pause)

          async_builder.send('tick', mouse)
        end

        it 'should create pauses for devices not passed when synchronous' do
          touch = builder.add_pointer_input(:touch, 'touch')
          expect(touch).to receive(:create_pause)
          expect(keyboard).not_to receive(:create_pause)
          expect(mouse).not_to receive(:create_pause)

          builder.send('tick', mouse, keyboard)
        end
      end # when adding a tick
    end # ActionBuilder
  end # WebDriver
end # Selenium
