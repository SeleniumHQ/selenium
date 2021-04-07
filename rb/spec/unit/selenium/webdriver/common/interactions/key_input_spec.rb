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
        let(:key_input) { KeyInput.new(:name) }
        let(:key) { 'a' }

        it 'should have a type of :key' do
          expect(key_input.type).to eq(:key)
        end

        context 'when encoding' do
          it 'should return nil if no_actions? is true' do
            allow(key_input).to receive(:no_actions?).and_return(true)
            expect(key_input.encode).to eq(nil)
          end

          it 'should return a hash if no_actions? is false' do
            allow(key_input).to receive(:no_actions?).and_return(false)
            expect(key_input.encode).to be_a(Hash)
          end

          it 'should contain a type key with the value equal to the type attribute' do
            allow(key_input).to receive(:no_actions?).and_return(false)
            expect(key_input.encode).to include(type: key_input.type)
          end

          it 'should contain an id key with the name of the input' do
            allow(key_input).to receive(:no_actions?).and_return(false)
            expect(key_input.encode).to include(id: key_input.name)
          end

          it 'should call the #encode method on all actions' do
            allow(key_input).to receive(:no_actions?).and_return(false)
            2.times { key_input.create_pause }
            act1, act2 = key_input.actions
            expect(act1).to receive(:encode)
            expect(act2).to receive(:encode)
            key_input.encode
          end

          it 'should contain an actions key with an array of actions' do
            allow(key_input).to receive(:no_actions?).and_return(false)
            allow(key_input.actions).to receive(:map).and_return([1, 2, 3])

            expect(key_input.encode).to include(actions: [1, 2, 3])
          end
        end # when encoding

        context 'when creating a key_down action' do
          it 'should create a TypingInteraction with the :down direction and key' do
            allow(KeyInput::TypingInteraction).to receive(:new).with(key_input, :down, key)
            allow(key_input).to receive(:add_action)

            key_input.create_key_down(key)
            expect(KeyInput::TypingInteraction).to have_received(:new).with(key_input, :down, key)
          end

          it 'should add the action to the list of actions' do
            allow(KeyInput::TypingInteraction).to receive(:new).and_return(:action)
            allow(key_input).to receive(:add_action).with(:action)

            key_input.create_key_down(key)
            expect(key_input).to have_received(:add_action).with(:action)
          end
        end # when creating a key_down action

        context 'when creating a key_up action' do
          it 'should create a TypingInteraction with the :up direction and key' do
            allow(KeyInput::TypingInteraction).to receive(:new).with(key_input, :up, key)
            allow(key_input).to receive(:add_action)

            key_input.create_key_up(key)
            expect(KeyInput::TypingInteraction).to have_received(:new).with(key_input, :up, key)
          end

          it 'should add the action to the list of actions' do
            allow(KeyInput::TypingInteraction).to receive(:new).and_return(:action)
            allow(key_input).to receive(:add_action).with(:action)

            key_input.create_key_up(key)
            expect(key_input).to have_received(:add_action).with(:action)
          end
        end # when creating a key_up action

        describe KeyInput::TypingInteraction do
          let(:source) { instance_double(KeyInput, type: Interactions::KEY) }
          let(:type) { :down }
          let(:typing) { KeyInput::TypingInteraction.new(source, type, key) }

          it 'should provide access to type' do
            expect(typing).to respond_to(:type)
          end

          it 'should raise a TypeError if the passed type is not a key in KeyInput::SUBTYPES' do
            expect { KeyInput::TypingInteraction.new(source, :none, key) }.to raise_error(TypeError)
          end

          it 'should retrieve the value for the given type from KeyInput::SUBTYPES' do
            expect(typing.type).to eq(KeyInput::SUBTYPES[type])
          end

          context 'when encoding' do
            it 'should return a hash' do
              expect(typing.encode).to be_a(Hash)
            end

            it 'should contain a type key equal to the type attribute' do
              expect(typing.encode).to include(type: typing.type)
            end

            it 'should contain a value key equal to the passed key value' do
              expect(typing.encode).to include(value: key)
            end
          end # when encoding
        end # KeyInput::TypingInteraction
      end # KeyInput
    end # Interactions
  end # WebDriver
end # Selenium
