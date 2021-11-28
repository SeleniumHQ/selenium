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
      describe PointerPress do
        let(:source) { Interactions.pointer(:mouse) }
        let(:direction) { :down }
        let(:button) { :left }
        let(:press) { PointerPress.new(source, direction, button) }

        describe '#initialize' do
          it 'raises a ArgumentError if invalid button symbol' do
            expect { PointerPress.new(source, direction, :none) }.to raise_error(ArgumentError)
          end

          it 'raises an TypeError if button is not a symbol or integer' do
            expect { PointerPress.new(source, direction, 'wrong') }.to raise_error(TypeError)
          end

          it 'raises an ArgumentError if button is negative' do
            expect { PointerPress.new(source, direction, -1) }.to raise_error(ArgumentError)
          end

          it 'accepts any positive integer' do
            expect { PointerPress.new(source, direction, 1141) }.not_to raise_error
          end

          it 'raises a ArgumentError if invalid direction' do
            expect { PointerPress.new(source, :none, button) }.to raise_error(ArgumentError)
          end
        end

        describe '#type' do
          it 'returns valid direction as type' do
            expect(press.type).to eq PointerPress::DIRECTIONS[direction]
          end
        end

        describe '#encode' do
          it 'returns a Hash with type and button' do
            expect(press.encode).to eq(type: PointerPress::DIRECTIONS[direction], button: 0)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
