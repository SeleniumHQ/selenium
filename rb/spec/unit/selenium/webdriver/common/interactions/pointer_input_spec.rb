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
      describe PointerInput do
        let(:kind) { PointerInput::KIND[:mouse] }
        let(:pointer) { PointerInput.new(kind, name: :name) }
        let(:interaction) { PointerCancel.new(pointer) }

        describe '#initialize' do
          it 'raises TypeError if kind is not recognized' do
            expect { PointerInput.new(:none) }.to raise_error(TypeError)
          end
        end

        describe '#type' do
          it 'returns :pointer' do
            expect(pointer.type).to eq(:pointer)
          end
        end

        describe '#kind' do
          it 'returns value' do
            expect(pointer.kind).to eq kind
          end
        end

        describe '#encode' do
          it 'returns nil if no_actions? is true' do
            allow(pointer).to receive(:no_actions?).and_return(true)
            expect(pointer.encode).to eq(nil)
          end

          it 'returns Hash with expected parameters if no_actions? is false' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.encode).to eq(type: :pointer, id: :name, parameters: {pointerType: :mouse}, actions: [])
          end

          it 'encodes each action' do
            allow(interaction).to receive(:encode).and_call_original
            2.times { pointer.add_action(interaction) }

            pointer.encode

            expect(interaction).to have_received(:encode).twice
          end
        end

        describe '#create_pointer_move' do
          it 'executes #add_action with created interaction' do
            allow(PointerMove).to receive(:new).with(pointer, 50, 51, 52, origin: nil)
                                               .and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_move(duration: 50, x: 51, y: 52)

            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_pointer_down' do
          it 'executes #add_action with created interaction' do
            allow(PointerPress).to receive(:new).with(pointer, :down, :left).and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_down(:left)

            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_pointer_up' do
          it 'executes #add_action with created interaction' do
            allow(PointerPress).to receive(:new).with(pointer, :up, :left).and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_up(:left)

            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_pointer_cancel' do
          it 'executes #add_action with created interaction' do
            allow(PointerCancel).to receive(:new).with(pointer).and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_cancel

            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end
      end # PointerInput

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
      end # PointerPress

      describe PointerMove do
        let(:source) { Interactions.pointer(:mouse) }
        let(:element) { instance_double(Element) }
        let(:origin) { PointerMove::POINTER }
        let(:duration) { 0.5 }
        let(:x) { 25 }
        let(:y) { 50 }

        describe '#type' do
          it 'equals :pointerMove' do
            move = PointerMove.new(source, duration, x, y)
            expect(move.type).to eq(:pointerMove)
          end
        end

        describe '#encode' do
          context 'with element' do
            it 'returns a Hash with source, duration, x and y' do
              move = PointerMove.new(source, duration, x, y, origin: element)

              ms = (duration * 1000).to_i
              expect(move.encode).to eq(type: move.type, origin: element, duration: ms, x: x, y: y)
            end
          end

          context 'with origin' do
            it 'returns a Hash with source, duration, x and y' do
              move = PointerMove.new(source, duration, x, y, origin: :pointer)

              ms = (duration * 1000).to_i
              expect(move.encode).to eq(type: move.type, origin: :pointer, duration: ms, x: x, y: y)
            end
          end
        end
      end # PointerMove

      describe PointerCancel do
        let(:pointer_cancel) { PointerCancel.new(Interactions.pointer(:mouse)) }

        describe '#type' do
          it 'equals :pointerCancel' do
            expect(pointer_cancel.type).to eq(:pointerCancel)
          end
        end

        describe '#encode' do
          it 'returns a Hash with type' do
            expect(pointer_cancel.encode).to eq(type: pointer_cancel.type)
          end
        end
      end # PointerCancel
    end # Interactions
  end # WebDriver
end # Selenium
