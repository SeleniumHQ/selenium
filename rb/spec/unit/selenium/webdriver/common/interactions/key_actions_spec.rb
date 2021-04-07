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
      let(:keyboard) { instance_double(Interactions::KeyInput) }
      let(:mouse) { instance_double(Interactions::PointerInput) }
      let(:bridge) { instance_double('Bridge').as_null_object }
      let(:builder) { Selenium::WebDriver::ActionBuilder.new(bridge, mouse, keyboard) }
      let(:element) { Selenium::WebDriver::Element.new(bridge, 'element') }
      let(:key) { 'a' }
      let(:keys) { 'abc' }

      context 'when performing a key action' do
        it 'should get the device if device name is supplied' do
          allow(builder).to receive(:get_device).with('name').and_return(keyboard)
          allow(keyboard).to receive(:create_key_down)
          allow(builder).to receive(:tick)

          builder.send('key_action', key, action: :create_key_down, device: 'name')
          expect(builder).to have_received(:get_device).with('name')
        end

        it 'should get the first key_input when no device name is supplied' do
          allow(builder).to receive(:get_device).with(nil)
          allow(builder).to receive(:key_inputs).and_return([keyboard])
          allow(keyboard).to receive(:create_key_down)
          allow(builder).to receive(:tick)

          builder.send('key_action', key, action: :create_key_down)
        end

        it 'should click the element if the first argument is a WebElement' do
          allow(builder).to receive(:get_device).and_return(keyboard)
          expect(builder).to receive(:click).with(element)
          allow(keyboard).to receive(:create_key_down)
          allow(builder).to receive(:tick)

          builder.send('key_action', element, key, action: :create_key_down)
        end

        it 'should create a key_down action for the key_input' do
          allow(builder).to receive(:get_device).and_return(keyboard)
          expect(keyboard).to receive(:create_key_down).with(key)
          allow(builder).to receive(:tick)

          builder.send('key_action', key, action: :create_key_down)
        end

        it 'should create a key_up action for the key_input' do
          allow(builder).to receive(:get_device).and_return(keyboard)
          expect(keyboard).to receive(:create_key_up).with(key)
          allow(builder).to receive(:tick)

          builder.send('key_action', key, action: :create_key_up)
        end

        it 'should pass the key_input to the #tick method' do
          allow(builder).to receive(:get_device).and_return(keyboard)
          allow(keyboard).to receive(:create_key_down)
          expect(builder).to receive(:tick).with(keyboard)

          builder.send('key_action', key, action: :create_key_down)
        end

        it 'should return itself' do
          allow(builder).to receive(:get_device).and_return(keyboard)
          allow(keyboard).to receive(:create_key_down)
          allow(builder).to receive(:tick).with(keyboard)

          expect(builder.send('key_action', key, action: :create_key_down)).to eq(builder)
        end
      end # when performing a key action

      it 'should create a key_down action' do
        expect(builder).to receive(:key_action).with(element, key, action: :create_key_down, device: 'name')
        builder.key_down(element, key, device: 'name')
      end

      it 'should create a key_up action' do
        expect(builder).to receive(:key_action).with(element, key, action: :create_key_up, device: 'name')
        builder.key_up(element, key, device: 'name')
      end

      context 'when sending keys' do
        it 'should click the element if the first argument is a WebElement' do
          expect(builder).to receive(:click).with(element)
          allow(builder).to receive(:key_down)
          allow(builder).to receive(:key_up)

          builder.send_keys(element, keys)
        end

        it 'should call key_down for each key passed' do
          expect(builder).to receive(:key_down).with(keys[0], device: nil)
          expect(builder).to receive(:key_down).with(keys[1], device: nil)
          expect(builder).to receive(:key_down).with(keys[2], device: nil)
          allow(builder).to receive(:key_up)

          builder.send_keys(keys)
        end

        it 'should call key_up for each key passed' do
          allow(builder).to receive(:key_down)
          expect(builder).to receive(:key_up).with(keys[0], device: nil)
          expect(builder).to receive(:key_up).with(keys[1], device: nil)
          expect(builder).to receive(:key_up).with(keys[2], device: nil)

          builder.send_keys(keys)
        end

        it 'should pass the device name to key_down and key_up commands' do
          expect(builder).to receive(:key_down).with(key, device: 'name')
          expect(builder).to receive(:key_up).with(key, device: 'name')

          builder.send_keys(key, device: 'name')
        end

        it 'should allow multiple string arguments' do
          expect(builder).to receive(:key_down).with('a', device: nil)
          expect(builder).to receive(:key_down).with('b', device: nil)
          expect(builder).to receive(:key_down).with('c', device: nil)
          allow(builder).to receive(:key_up)

          builder.send_keys('a', 'b', 'c')
        end

        it 'should allow string and symbol arguments' do
          expect(builder).to receive(:key_down).with('a', device: nil)
          expect(builder).to receive(:key_down).with(:shift, device: nil)
          expect(builder).to receive(:key_down).with('c', device: nil)
          allow(builder).to receive(:key_up)

          builder.send_keys('a', :shift, 'c')
        end
      end # when sending keys
    end # KeyActions
  end # WebDriver
end # Selenium
