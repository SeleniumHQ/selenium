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
      describe InputDevice do
        let(:device) do
          Class.new(InputDevice) {
            def type
              :none
            end
          }.new
        end

        let(:action) { Pause.new(device) }

        it 'should provide access to name' do
          expect(device).to respond_to(:name)
        end

        it 'should provide access to actions' do
          expect(device).to respond_to(:actions)
        end

        it 'should assign a random UUID if no name is provided' do
          allow(SecureRandom).to receive(:uuid).and_return(:id)

          expect(InputDevice.new.name).to eq(:id)
        end

        context 'when adding an action' do
          it 'should raise a TypeError if the action is not a descendant of Interaction' do
            expect { device.add_action('action') }.to raise_error(TypeError)
          end

          it 'should add action to actions array' do
            expect { device.add_action(action) }.to change(device, :actions).from([]).to([action])
          end
        end # when adding an action

        it 'should clear actions' do
          expect(device.actions).to receive(:clear)

          device.clear_actions
        end

        context 'when creating a pause' do
          it 'should create a pause action' do
            allow(Pause).to receive(:new).with(device, 5).and_return(action)

            expect { device.create_pause(5) }.to change(device, :actions).from([]).to([action])
            expect(Pause).to have_received(:new).with(device, 5)
          end

          it 'should add a pause action' do
            allow(Pause).to receive(:new).with(device, 5).and_return(:pause)
            expect(device).to receive(:add_action).with(:pause)

            device.create_pause(5)
          end
        end # when creating a pause

        context 'when checking for all pauses' do
          let(:typing) { instance_double(KeyInput::TypingInteraction, type: :not_pause) }

          it 'should return true when all actions are pauses' do
            allow(device).to receive(:type).and_return(:none)
            2.times { device.create_pause }
            expect(device.no_actions?).to be true
          end

          it 'should return true when not all actions are pauses' do
            allow(device).to receive(:type).and_return(:none)
            allow(typing).to receive(:class).and_return(KeyInput::TypingInteraction)
            device.create_pause
            device.add_action(typing)
            expect(device.no_actions?).to be false
          end
        end # when checking for all pauses
      end # InputDevice
    end # Interactions
  end # WebDriver
end # Selenium
