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
    describe PointerActions do
      let(:keyboard) { instance_double(Interactions::KeyInput) }
      let(:mouse) { instance_double(Interactions::PointerInput) }
      let(:bridge) { instance_double('Bridge').as_null_object }
      let(:builder) { ActionBuilder.new(bridge, mouse, keyboard) }
      let(:element) { Element.new(bridge, 'element') }
      let(:element2) { Element.new(bridge, 'element2') }
      let(:duration) { builder.default_move_duration }
      let(:dimension) { 100 }

      it 'should get a pointer by device name' do
        allow(builder).to receive(:get_device).with('name').and_return(mouse)

        builder.send('get_pointer', 'name')
        expect(builder).to have_received(:get_device).with('name')
      end

      it 'should get the first pointer_input when no device name is supplied' do
        expect(builder).to receive(:get_device).with(nil)
        allow(builder).to receive(:pointer_inputs).and_return([mouse])

        builder.send('get_pointer')
        expect(builder).to have_received(:pointer_inputs)
      end

      context 'when performing a button action' do
        it 'should get the pointer device to use' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_down)
          allow(builder).to receive(:tick)

          builder.send('button_action', :left, action: :create_pointer_down)
          expect(builder).to have_received(:get_pointer)
        end

        it 'should create a pointer_down action for the pointer' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          expect(mouse).to receive(:create_pointer_down).with(:left)
          allow(builder).to receive(:tick)

          builder.send('button_action', :left, action: :create_pointer_down)
        end

        it 'should create a pointer_up action for the pointer' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          expect(mouse).to receive(:create_pointer_up).with(:left)
          allow(builder).to receive(:tick)

          builder.send('button_action', :left, action: :create_pointer_up)
        end

        it 'should pass the pointer to the #tick method' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_down)
          expect(builder).to receive(:tick).with(mouse)

          builder.send('button_action', :left, action: :create_pointer_down)
        end

        it 'should return itself' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_down)
          allow(builder).to receive(:tick).with(mouse)

          expect(builder.send('button_action', :left, action: :create_pointer_down)).to eq(builder)
        end
      end # when performing a button action

      it 'should create a pointer_down action' do
        expect(builder).to receive(:button_action).with(:left, action: :create_pointer_down, device: 'name')
        builder.pointer_down(:left, device: 'name')
      end

      it 'should create a pointer_up action' do
        expect(builder).to receive(:button_action).with(:left, action: :create_pointer_up, device: 'name')
        builder.pointer_up(:left, device: 'name')
      end

      context 'when moving the pointer to an element' do
        it 'should get the pointer device to use' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick)

          builder.move_to(element)
          expect(builder).to have_received(:get_pointer)
        end

        it 'should create a move with the element' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          expect(mouse).to receive(:create_pointer_move).with(hash_including(element: element))
          allow(builder).to receive(:tick)

          builder.move_to(element)
        end

        it 'should create a move with the default move duration' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          expect(mouse).to receive(:create_pointer_move).with(hash_including(duration: duration))
          allow(builder).to receive(:tick)

          builder.move_to(element)
        end

        it 'should create a move with x and y as 0 when no offsets are passed' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(x: 0, y: 0))
          allow(builder).to receive(:tick)

          builder.move_to(element)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(x: 0, y: 0))
        end

        it 'should calculate the x value from the element left 0 location when x offset is passed' do
          right_by = 10
          left = right_by - (dimension / 2)
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(element).to receive(:size).and_return(width: dimension, height: dimension)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(x: left))
          allow(builder).to receive(:tick)

          builder.move_to(element, right_by)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(x: left))
        end

        it 'should calculate the y value from the element top 0 location when y offset is passed' do
          down_by = 10
          top = down_by - (dimension / 2)
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(element).to receive(:size).and_return(width: dimension, height: dimension)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(y: top))
          allow(builder).to receive(:tick)

          builder.move_to(element, 0, down_by)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(y: top))
        end

        it 'should pass the pointer to the #tick method' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick).with(mouse)

          builder.move_to(element)
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'should return itself' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick).with(mouse)

          expect(builder.move_to(element)).to eq(builder)
        end
      end # when moving the pointer to an element

      context 'when moving the pointer from current location' do
        it 'should get the pointer device to use' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick)

          builder.move_by(5, 5)
          expect(builder).to have_received(:get_pointer)
        end

        it 'should create a move with the default move duration' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(duration: duration))
          allow(builder).to receive(:tick)

          builder.move_by(5, 5)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(duration: duration))
        end

        it 'should create a move with the pointer as the origin' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(origin: Interactions::PointerMove::POINTER))
          allow(builder).to receive(:tick)

          builder.move_by(5, 5)
          expect(mouse).to have_received(:create_pointer_move)
            .with(hash_including(origin: Interactions::PointerMove::POINTER))
        end

        it 'should create a move with given offsets' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(x: 5, y: 5))
          allow(builder).to receive(:tick)

          builder.move_by(5, 5)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(x: 5, y: 5))
        end

        it 'should pass the pointer to the #tick method' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick).with(mouse)

          builder.move_by(5, 5)
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'should return itself' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick).with(mouse)

          expect(builder.move_by(5, 5)).to eq(builder)
        end
      end # when moving the pointer from current location

      context 'when moving the pointer to a specific location' do
        it 'should get the pointer device to use' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick)

          builder.move_to_location(5, 5)
          expect(builder).to have_received(:get_pointer)
        end

        it 'should create a move with the default move duration' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(duration: duration))
          allow(builder).to receive(:tick)

          builder.move_to_location(5, 5)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(duration: duration))
        end

        it 'should create a move with the viewport as the origin' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
            .with(hash_including(origin: Interactions::PointerMove::VIEWPORT))
          allow(builder).to receive(:tick)

          builder.move_to_location(5, 5)
          expect(mouse).to have_received(:create_pointer_move)
            .with(hash_including(origin: Interactions::PointerMove::VIEWPORT))
        end

        it 'should create a move with given location' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move).with(hash_including(x: 5, y: 5))
          allow(builder).to receive(:tick)

          builder.move_to_location(5, 5)
          expect(mouse).to have_received(:create_pointer_move).with(hash_including(x: 5, y: 5))
        end

        it 'should pass the pointer to the #tick method' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick).with(mouse)

          builder.move_to_location(5, 5)
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'should return itself' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(mouse).to receive(:create_pointer_move)
          allow(builder).to receive(:tick).with(mouse)

          expect(builder.move_to_location(5, 5)).to eq(builder)
        end
      end # when moving the pointer from current location

      context 'when performing a click and hold with the left mouse button' do
        it 'should move to the element if a WebElement is passed' do
          allow(builder).to receive(:move_to).with(element, device: 'name')
          allow(builder).to receive(:pointer_down)

          builder.click_and_hold(element, device: 'name')
          expect(builder).to have_received(:move_to).with(element, device: 'name')
        end

        it 'should perform a pointer_down action with the left mouse button' do
          allow(builder).to receive(:pointer_down).with(:left, device: 'name')

          builder.click_and_hold(device: 'name')
          expect(builder).to have_received(:pointer_down).with(:left, device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:pointer_down)

          expect(builder.click_and_hold(device: 'name')).to eq(builder)
        end
      end # when performing a click and hold with the left mouse button

      context 'when releasing the left mouse button' do
        it 'should perform a pointer_up action with the left mouse button' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(builder).to receive(:pointer_up).with(:left, device: 'name')

          builder.release(device: 'name')
          expect(builder).to have_received(:pointer_up).with(:left, device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:get_pointer).and_return(mouse)
          allow(builder).to receive(:pointer_up)

          expect(builder.release(device: 'name')).to eq(builder)
        end
      end # when releasing the left mouse button

      context 'when performing a click with the left mouse button' do
        it 'should perform a #move_to if a WebElement is passed' do
          allow(builder).to receive(:move_to).with(element, device: 'name')
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:pointer_up)

          builder.click(element, device: 'name')
          expect(builder).to have_received(:move_to).with(element, device: 'name')
        end

        it 'should perform a #pointer_down with the left mouse button' do
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:pointer_down).with(:left, device: 'name')
          allow(builder).to receive(:pointer_up)

          builder.click(device: 'name')
          expect(builder).to have_received(:pointer_down).with(:left, device: 'name')
        end

        it 'should perform a pointer_up action with the left mouse button' do
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:pointer_up).with(:left, device: 'name')

          builder.click(device: 'name')
          expect(builder).to have_received(:pointer_up).with(:left, device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:pointer_up)

          expect(builder.click(device: 'name')).to eq(builder)
        end
      end # when performing a click with the left mouse button

      context 'when performing a double-click with the left mouse button' do
        it 'should perform a #move_to if a WebElement is passed' do
          expect(builder).to receive(:move_to).with(element, device: 'name')
          expect(builder).to receive(:click).twice

          builder.double_click(element, device: 'name')
        end

        it 'should perform a #click twice with the left mouse button' do
          expect(builder).to receive(:click).twice

          builder.double_click(device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:click)

          expect(builder.double_click(device: 'name')).to eq(builder)
        end
      end # when performing a double-click with the left mouse button

      context 'when performing a context_click with the right mouse button' do
        it 'should perform a #move_to if a WebElement is passed' do
          allow(builder).to receive(:move_to).with(element, device: 'name')
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:pointer_up)

          builder.context_click(element, device: 'name')
          expect(builder).to have_received(:move_to).with(element, device: 'name')
        end

        it 'should perform a #pointer_down with the left mouse button' do
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:pointer_down).with(:right, device: 'name')
          allow(builder).to receive(:pointer_up)

          builder.context_click(device: 'name')
          expect(builder).to have_received(:pointer_down).with(:right, device: 'name')
        end

        it 'should perform a pointer_up action with the left mouse button' do
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:pointer_up).with(:right, device: 'name')

          builder.context_click(device: 'name')
          expect(builder).to have_received(:pointer_up).with(:right, device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:pointer_up)

          expect(builder.context_click(device: 'name')).to eq(builder)
        end
      end # when performing a context_click with the right mouse button

      context 'when performing a drag_and_drop' do
        it 'should perform a #click_and_hold on the source WebElement' do
          allow(builder).to receive(:click_and_hold).with(element, device: 'name')
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:release)

          builder.drag_and_drop(element, element2, device: 'name')
          expect(builder).to have_received(:click_and_hold).with(element, device: 'name')
        end

        it 'should perform a #move_to to the target WebElement' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_to).with(element2, device: 'name')
          allow(builder).to receive(:release)

          builder.drag_and_drop(element, element2, device: 'name')
          expect(builder).to have_received(:move_to).with(element2, device: 'name')
        end

        it 'should perform a #release' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:release).with(device: 'name')

          builder.drag_and_drop(element, element2, device: 'name')
          expect(builder).to have_received(:release).with(device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:release)

          expect(builder.drag_and_drop(element, element2)).to eq(builder)
        end
      end # when performing a drag_and_drop

      context 'when performing a drag_and_drop_by' do
        it 'should perform a #click_and_hold on the source WebElement' do
          allow(builder).to receive(:click_and_hold).with(element, device: 'name')
          allow(builder).to receive(:move_by)
          allow(builder).to receive(:release)

          builder.drag_and_drop_by(element, 5, 5, device: 'name')
          expect(builder).to have_received(:click_and_hold).with(element, device: 'name')
        end

        it 'should perform a #move_by with the given offsets' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_by).with(5, 5, device: 'name')
          allow(builder).to receive(:release)

          builder.drag_and_drop_by(element, 5, 5, device: 'name')
          expect(builder).to have_received(:move_by).with(5, 5, device: 'name')
        end

        it 'should perform a #release' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_by)
          allow(builder).to receive(:release).with(device: 'name')

          builder.drag_and_drop_by(element, 5, 5, device: 'name')
          expect(builder).to have_received(:release).with(device: 'name')
        end

        it 'should return itself' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_by)
          allow(builder).to receive(:release)

          expect(builder.drag_and_drop_by(element, 5, 5)).to eq(builder)
        end
      end # when performing a drag_and_drop_by
    end # PointerActions
  end # WebDriver
end # Selenium
