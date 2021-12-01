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
      describe TypingInteraction do
        let(:source) { Interactions.key('keyboard') }
        let(:type) { :down }
        let(:typing) { TypingInteraction.new(source, type, key) }
        let(:key) { 'a' }

        describe '#initialize' do
          it 'raises a TypeError if the passed source is not a KeyInput' do
            mouse = Interactions.pointer(:mouse)
            expect { TypingInteraction.new(mouse, type, key) }.to raise_error(TypeError)
          end

          it 'raises a TypeError if the passed type is not a key in KeyInput::SUBTYPES' do
            expect { TypingInteraction.new(source, :none, key) }.to raise_error(TypeError)
          end
        end

        describe '#type' do
          it 'stores type as KeyInput::SUBTYPES' do
            expect(typing.type).to eq KeyInput::SUBTYPES[type]
          end
        end

        describe '#encode' do
          it 'returns a Hash with type and value' do
            expect(typing.encode).to eq(type: typing.type, value: key)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
