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
        let(:device_class) do
          Class.new(InputDevice) do
            def type
              :none
            end
          end
        end
        let(:device) { device_class.new }
        let(:action) { Pause.new(device) }

        describe '#name' do
          it 'returns provided name' do
            device = device_class.new('name')
            expect(device.name).to eq 'name'
          end

          it 'returns a random UUID if no name is provided' do
            allow(SecureRandom).to receive(:uuid).and_return(:id)

            expect(device.name).to eq(:id)
          end
        end

        describe '#actions' do
          it 'returns empty array by default' do
            expect(device.actions).to eq []
          end
        end

        describe '#add_action' do
          it 'raises a TypeError if the action is not a an Interaction' do
            expect { device.add_action('action') }.to raise_error(TypeError)
          end

          it 'adds action to actions array' do
            expect { device.add_action(action) }.to change(device, :actions).from([]).to([action])
          end
        end

        describe '#clear_actions' do
          it 'empties the actions array' do
            device.add_action(action)

            device.clear_actions
            expect(device.actions).to be_empty
          end
        end

        describe '#create_pause' do
          it 'adds pause action with provided duration to actions array' do
            allow(Pause).to receive(:new).and_return(action)
            allow(device).to receive(:add_action).and_call_original

            expect { device.create_pause(5) }.to change(device, :actions).from([]).to([action])
            expect(Pause).to have_received(:new).with(device, 5)
            expect(device).to have_received(:add_action).with(action)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
