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

        it 'should have a type of :pointer' do
          expect(pointer.type).to eq(:pointer)
        end

        it 'should provide access to kind' do
          expect(pointer).to respond_to(:kind)
        end

        it 'should raise a TypeError if the passed kind is not a key in PointerInput::KIND' do
          expect { PointerInput.new(:key) }.to raise_error(TypeError)
        end

        it 'should retrieve the value for the given kind from PointerInput::KIND' do
          expect(pointer.kind).to eq(PointerInput::KIND[kind])
        end

        context 'when creating a pointer_move action' do
          it 'should create a PointerMove with the the given parameters' do
            expect(PointerMove).to receive(:new).with(pointer, 50, 51, 52, element: 'a', origin: 'b')
            allow(pointer).to receive(:add_action)
            pointer.create_pointer_move(duration: 50, x: 51, y: 52, element: 'a', origin: 'b')
          end

          it 'should add the action to the list of actions' do
            allow(PointerMove).to receive(:new).and_return(:action)
            expect(pointer).to receive(:add_action).with(:action)
            pointer.create_pointer_move
          end
        end # when creating a pointer_move action

        context 'when creating a pointer_down action' do
          it 'should create a PointerPress with the :down direction and the given button' do
            expect(PointerPress).to receive(:new).with(pointer, :down, :button)
            allow(pointer).to receive(:add_action)
            pointer.create_pointer_down(:button)
          end

          it 'should add the action to the list of actions' do
            allow(PointerPress).to receive(:new).and_return(:action)
            expect(pointer).to receive(:add_action).with(:action)
            pointer.create_pointer_down(:button)
          end
        end # when creating a pointer_down action

        context 'when creating a pointer_up action' do
          it 'should create a PointerPress with the :up direction and the given button' do
            expect(PointerPress).to receive(:new).with(pointer, :up, :button)
            allow(pointer).to receive(:add_action)
            pointer.create_pointer_up(:button)
          end

          it 'should add the action to the list of actions' do
            allow(PointerPress).to receive(:new).and_return(:action)
            expect(pointer).to receive(:add_action).with(:action)
            pointer.create_pointer_up(:button)
          end
        end # when creating a pointer_up action

        context 'when creating a pointer_cancel action' do
          it 'should create a PointerPress with the :up direction and the given button' do
            expect(PointerCancel).to receive(:new).with(pointer)
            allow(pointer).to receive(:add_action)
            pointer.create_pointer_cancel
          end

          it 'should add the action to the list of actions' do
            allow(PointerCancel).to receive(:new).and_return(:action)
            expect(pointer).to receive(:add_action).with(:action)
            pointer.create_pointer_cancel
          end
        end # when creating a pointer_cancel action

        context 'when encoding' do
          it 'should return nil if no_actions? is true' do
            allow(pointer).to receive(:no_actions?).and_return(true)
            expect(pointer.encode).to eq(nil)
          end

          it 'should return a hash if no_actions? is false' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.encode).to be_a(Hash)
          end
          it 'should contain a type key with the value of the type attribute' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.encode).to include(type: pointer.type)
          end

          it 'should contain an id key with the name of the input' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.encode).to include(id: pointer.name)
          end

          it 'should call the #encode method on all actions' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            2.times { pointer.create_pause }
            act1, act2 = pointer.actions
            expect(act1).to receive(:encode)
            expect(act2).to receive(:encode)
            pointer.encode
          end

          it 'should contain an actions key with an array of actions' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.actions).to receive(:map).and_return([1, 2, 3])
            expect(pointer.encode).to include(actions: [1, 2, 3])
          end

          it 'should contain a parameters key' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.encode).to include(:parameters)
          end

          it 'should contain a parameters hash with a pointerType key equal to the kind attribute' do
            allow(pointer).to receive(:no_actions?).and_return(false)
            expect(pointer.encode[:parameters]).to include(pointerType: pointer.kind)
          end
        end # when encoding
      end # PointerInput

      describe PointerPress do
        let(:source) { instance_double(PointerInput, type: Interactions::POINTER) }
        let(:direction) { :down }
        let(:button) { :left }
        let(:press) { PointerPress.new(source, direction, button) }

        it 'should have the type equal to the direction attribute' do # rubocop:disable RSpec/RepeatedExample
          expect(press.type).to eq(PointerPress::DIRECTIONS[direction])
        end

        # TODO: rewrite this test so it's not a duplicate of above or remove
        it 'should retrieve the value for the given direction from PointerPress::DIRECTIONS' do # rubocop:disable RSpec/RepeatedExample
          expect(press.type).to eq(PointerPress::DIRECTIONS[direction])
        end

        it 'should raise a TypeError if the passed direction is not a key in PointerPress::DIRECTIONS' do
          expect { PointerPress.new(source, :none, button) }.to raise_error(TypeError)
        end

        context 'when determining button' do
          context 'when button parameter is a symbol' do
            it 'should raise a TypeError if the passed button is not a key in PointerPress::BUTTONS' do
              expect { PointerPress.new(source, direction, :bad) }.to raise_error(TypeError)
            end

            it 'should retrieve the value for the given button from PointerPress::BUTTONS' do
              expect(press.instance_variable_get(:@button)).to eq(PointerPress::BUTTONS[button])
            end

            it 'should return an integer value' do
              expect(press.instance_variable_get(:@button)).to be_an(Integer)
            end
          end # when button parameter is a symbol

          context 'when button parameter is not a symbol' do
            it 'should raise an ArgumentError if the passed button is not a positive Integer' do
              expect { PointerPress.new(source, direction, -1) }.to raise_error(ArgumentError)
            end

            it 'should return an integer value' do
              expect(PointerPress.new(source, direction, 1).instance_variable_get(:@button)).to be_an(Integer)
            end
          end # when button parameter is not a symbol
        end # when determining button

        context 'when encoding' do
          it 'should return a hash' do
            expect(press.encode).to be_a(Hash)
          end

          it 'should contain a type key equal to the type' do
            expect(press.encode).to include(type: press.type)
          end

          it 'should contain a button key equal to the button attribute' do
            expect(press.encode).to include(button: press.instance_variable_get(:@button))
          end
        end # when encoding
      end # PointerPress

      describe PointerMove do
        let(:source) { instance_double(PointerInput, type: Interactions::POINTER) }
        let(:element) { instance_double(Element) }
        let(:origin) { PointerMove::POINTER }
        let(:duration) { 0.5 }
        let(:x) { 25 }
        let(:y) { 50 }
        let(:move) { PointerMove.new(source, duration, x, y, element: element, origin: origin) }

        it 'should have the type equal to :pointerMove' do
          expect(move.type).to eq(:pointerMove)
        end

        it 'should assign the duration attribute to the parameter multiplied by 1000' do
          expect(move.instance_variable_get(:@duration)).to eq(duration * 1000)
        end

        it 'should assign the origin attribute to the element parameter if provided' do
          expect(move.instance_variable_get(:@origin)).to eq(element)
        end

        it 'should assign the origin attribute to the origin parameter if element is not provided' do
          expect(PointerMove.new(source, duration, x, y, origin: origin).instance_variable_get(:@origin)).to eq(origin)
        end

        context 'when encoding' do
          it 'should return a hash' do
            expect(move.encode).to be_a(Hash)
          end

          it 'should contain a type key equal to the type' do
            expect(move.encode).to include(type: move.type)
          end

          it 'should contain a duration key equal to the duration attribute' do
            expect(move.encode).to include(duration: move.instance_variable_get(:@duration))
          end

          it 'should convert the duration attribute value to an integer' do
            new_move = PointerMove.new(source, 0.00303, x, y, element: element)
            expect(new_move.encode[:duration]).to be_an(Integer)
          end

          it 'should contain an x key equal to the x_offset attribute' do
            expect(move.encode).to include(x: move.instance_variable_get(:@x_offset))
          end

          it 'should contain an y key equal to the y_offset attribute' do
            expect(move.encode).to include(y: move.instance_variable_get(:@y_offset))
          end

          it 'should contain an origin key equal to the element' do
            expect(move.encode).to include(origin: element)
          end
        end # when encoding
      end # PointerMove

      describe PointerCancel do
        let(:source) { instance_double(PointerInput, type: Interactions::POINTER) }
        let(:cancel) { PointerCancel.new(source) }

        it 'should have the type equal to :pointerCancel' do
          expect(cancel.type).to eq(:pointerCancel)
        end

        context 'when encoding' do
          it 'should return a hash' do
            expect(cancel.encode).to be_a(Hash)
          end

          it 'should contain a type key equal to the type' do
            expect(cancel.encode).to include(type: cancel.type)
          end
        end # when encoding
      end # PointerCancel
    end # Interactions
  end # WebDriver
end # Selenium
