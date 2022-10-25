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
      let(:mouse) { Interactions::PointerInput.new(:mouse, name: 'pointer') }
      let(:bridge) { instance_double(Remote::Bridge) }
      let(:builder) { ActionBuilder.new(bridge, devices: [mouse]) }
      let(:element) { Element.new(bridge, 'element') }
      let(:element2) { Element.new(bridge, 'element2') }
      let(:duration) { builder.default_move_duration }
      let(:dimension) { 100 }

      describe '#pointer_input' do
        it 'gets key input by name' do
          expect(builder.send(:pointer_input, mouse.name)).to eq mouse
        end

        it 'raises ArgumentError if no device exists with that name' do
          expect { builder.send(:pointer_input, 'none') }.to raise_error(ArgumentError)
        end

        it 'gets default pointer input' do
          expect(builder.send(:pointer_input)).to eq mouse
        end
      end

      describe '#pointer_down' do
        it 'gets pointer_input' do
          allow(builder).to receive(:pointer_input).and_call_original

          builder.pointer_down :left, device: mouse.name

          expect(builder).to have_received(:pointer_input).with(mouse.name)
        end

        it 'passes the pointer to the #tick method' do
          allow(builder).to receive(:tick)

          builder.pointer_down :left
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'returns itself' do
          expect(builder.pointer_down(:left)).to eq(builder)
        end
      end

      describe '#pointer_up' do
        it 'gets pointer_input' do
          allow(builder).to receive(:pointer_input).and_call_original

          builder.pointer_up :left, device: mouse.name

          expect(builder).to have_received(:pointer_input).with(mouse.name)
        end

        it 'calls #create_pointer_up' do
          allow(mouse).to receive(:create_pointer_up)
          builder.pointer_up :left

          expect(mouse).to have_received :create_pointer_up
        end

        it 'passes the pointer to the #tick method' do
          allow(builder).to receive(:tick)

          builder.pointer_up :left
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'returns itself' do
          expect(builder.pointer_up(:left)).to eq(builder)
        end
      end

      describe '#move_to' do
        it 'gets pointer_input' do
          allow(builder).to receive(:pointer_input).and_call_original
          allow(bridge).to receive(:element_size).and_return(height: 768, width: 1024)

          builder.move_to element, 5, 5, device: mouse.name

          expect(builder).to have_received(:pointer_input).with(mouse.name)
        end

        it 'calls create_pointer_move with offsets' do
          allow(mouse).to receive(:create_pointer_move).and_call_original

          right_by = 5
          down_by = 8

          builder.move_to(element, right_by, down_by)
          expect(mouse).to have_received(:create_pointer_move).with(duration: duration,
                                                                    x: right_by,
                                                                    y: down_by,
                                                                    origin: element)
        end

        it 'passes the pointer to the #tick method' do
          allow(builder).to receive(:tick)

          builder.move_to(element)
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'returns itself' do
          expect(builder.move_to(element)).to eq(builder)
        end
      end

      describe '#move_by' do
        it 'gets pointer_input' do
          allow(builder).to receive(:pointer_input).and_call_original

          builder.move_by 5, 5, device: mouse.name

          expect(builder).to have_received(:pointer_input).with(mouse.name)
        end

        it 'calls create_pointer_move with offsets' do
          allow(mouse).to receive(:create_pointer_move).and_call_original

          builder.move_by(5, 5)

          expect(mouse).to have_received(:create_pointer_move).with(duration: duration, origin: :pointer, x: 5, y: 5)
        end

        it 'passes the pointer to the #tick method' do
          allow(builder).to receive(:tick)

          builder.move_by(5, 5)

          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'returns itself' do
          expect(builder.move_by(5, 5)).to eq(builder)
        end
      end

      describe '#move_to_location' do
        it 'gets pointer_input' do
          allow(builder).to receive(:pointer_input).and_call_original

          builder.move_to_location 5, 5, device: mouse.name

          expect(builder).to have_received(:pointer_input).with(mouse.name)
        end

        it 'calls create_pointer_move with offsets' do
          allow(mouse).to receive(:create_pointer_move).and_call_original

          builder.move_to_location(5, 5)

          expect(mouse).to have_received(:create_pointer_move).with(duration: duration, origin: :viewport, x: 5, y: 5)
        end

        it 'passes the pointer to the #tick method' do
          allow(builder).to receive(:tick)

          builder.move_to_location(5, 5)
          expect(builder).to have_received(:tick).with(mouse)
        end

        it 'returns itself' do
          expect(builder.move_to_location(5, 5)).to eq(builder)
        end
      end

      describe '#click_and_hold' do
        it 'calls move_to and pointer_down with specified pointer' do
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:move_to)

          builder.click_and_hold(element, device: 'pointer')

          expect(builder).to have_received(:pointer_down).with(:left, device: 'pointer')
          expect(builder).to have_received(:move_to).with(element, device: 'pointer')
        end

        it 'calls move_to and pointer_down with the supplied pointer by default' do
          allow(builder).to receive(:pointer_down)
          allow(builder).to receive(:move_to)

          builder.click_and_hold(element)

          expect(builder).to have_received(:pointer_down).with(:left, device: nil)
          expect(builder).to have_received(:move_to).with(element, device: nil)
        end

        it 'returns itself' do
          expect(builder.click_and_hold(element)).to eq(builder)
        end
      end

      describe '#release' do
        it 'calls pointer_up with specified pointer' do
          allow(builder).to receive(:pointer_up)

          builder.release(device: 'pointer')

          expect(builder).to have_received(:pointer_up).with(:left, device: 'pointer')
        end

        it 'calls pointer_up with the supplied pointer by default' do
          allow(builder).to receive(:pointer_up)

          builder.release
          expect(builder).to have_received(:pointer_up).with(:left, device: nil)
        end

        it 'returns itself' do
          expect(builder.release).to eq(builder)
        end
      end

      describe '#click' do
        context 'with element specified' do
          it 'calls move and presses with specified pointer' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.click(element, device: 'pointer')

            expect(builder).to have_received(:move_to).with(element, device: 'pointer')
            expect(builder).to have_received(:pointer_down).with(:left, device: 'pointer')
            expect(builder).to have_received(:pointer_up).with(:left, device: 'pointer')
          end

          it 'calls move and presses with the supplied pointer by default' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.click(element)

            expect(builder).to have_received(:move_to).with(element, device: nil)
            expect(builder).to have_received(:pointer_down).with(:left, device: nil)
            expect(builder).to have_received(:pointer_up).with(:left, device: nil)
          end
        end

        context 'without element specified' do
          it 'calls presses with specified pointer' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.click(device: 'pointer')

            expect(builder).not_to have_received(:move_to)
            expect(builder).to have_received(:pointer_down).with(:left, device: 'pointer')
            expect(builder).to have_received(:pointer_up).with(:left, device: 'pointer')
          end

          it 'calls presses with the supplied pointer by default' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.click

            expect(builder).not_to have_received(:move_to)
            expect(builder).to have_received(:pointer_down).with(:left, device: nil)
            expect(builder).to have_received(:pointer_up).with(:left, device: nil)
          end
        end

        it 'returns itself' do
          expect(builder.click(element)).to eq(builder)
        end
      end

      describe '#double_click' do
        context 'with element specified' do
          it 'calls move and presses with specified pointer' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.double_click(element, device: 'pointer')

            expect(builder).to have_received(:move_to).with(element, device: 'pointer')
            expect(builder).to have_received(:pointer_down).with(:left, device: 'pointer').twice
            expect(builder).to have_received(:pointer_up).with(:left, device: 'pointer').twice
          end

          it 'calls move and presses with the supplied pointer by default' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.double_click(element)

            expect(builder).to have_received(:move_to).with(element, device: nil)
            expect(builder).to have_received(:pointer_down).with(:left, device: nil).twice
            expect(builder).to have_received(:pointer_up).with(:left, device: nil).twice
          end
        end

        context 'without element specified' do
          it 'calls presses with specified pointer' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.double_click(device: 'pointer')

            expect(builder).not_to have_received(:move_to)
            expect(builder).to have_received(:pointer_down).with(:left, device: 'pointer').twice
            expect(builder).to have_received(:pointer_up).with(:left, device: 'pointer').twice
          end

          it 'calls presses with the supplied pointer by default' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.double_click

            expect(builder).not_to have_received(:move_to)
            expect(builder).to have_received(:pointer_down).with(:left, device: nil).twice
            expect(builder).to have_received(:pointer_up).with(:left, device: nil).twice
          end
        end

        it 'returns itself' do
          expect(builder.double_click(element)).to eq(builder)
        end
      end

      describe '#context_click' do
        context 'with element specified' do
          it 'calls move and presses with specified pointer' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.context_click(element, device: 'pointer')

            expect(builder).to have_received(:move_to).with(element, device: 'pointer')
            expect(builder).to have_received(:pointer_down).with(:right, device: 'pointer')
            expect(builder).to have_received(:pointer_up).with(:right, device: 'pointer')
          end

          it 'calls move and presses with the supplied pointer by default' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.context_click(element)

            expect(builder).to have_received(:move_to).with(element, device: nil)
            expect(builder).to have_received(:pointer_down).with(:right, device: nil)
            expect(builder).to have_received(:pointer_up).with(:right, device: nil)
          end
        end

        context 'without element specified' do
          it 'calls presses with specified pointer' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.context_click(device: 'pointer')

            expect(builder).not_to have_received(:move_to)
            expect(builder).to have_received(:pointer_down).with(:right, device: 'pointer')
            expect(builder).to have_received(:pointer_up).with(:right, device: 'pointer')
          end

          it 'calls presses with the supplied pointer by default' do
            allow(builder).to receive(:move_to)
            allow(builder).to receive(:pointer_down)
            allow(builder).to receive(:pointer_up)

            builder.context_click

            expect(builder).not_to have_received(:move_to)
            expect(builder).to have_received(:pointer_down).with(:right, device: nil)
            expect(builder).to have_received(:pointer_up).with(:right, device: nil)
          end
        end

        it 'returns itself' do
          expect(builder.context_click(element)).to eq(builder)
        end
      end

      describe '#drag_and_drop' do
        it 'calls click_and_hold, move_to and release with specified pointer' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:release)

          builder.drag_and_drop(element, element2, device: 'pointer')

          expect(builder).to have_received(:click_and_hold).with(element, device: 'pointer')
          expect(builder).to have_received(:move_to).with(element2, device: 'pointer')
          expect(builder).to have_received(:release).with(device: 'pointer')
        end

        it 'calls click_and_hold, move_to and release with the supplied pointer by default' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_to)
          allow(builder).to receive(:release)

          builder.drag_and_drop(element, element2)

          expect(builder).to have_received(:click_and_hold).with(element, device: nil)
          expect(builder).to have_received(:move_to).with(element2, device: nil)
          expect(builder).to have_received(:release).with(device: nil)
        end

        it 'returns itself' do
          expect(builder.drag_and_drop(element, element2)).to eq(builder)
        end
      end

      describe '#drag_and_drop_by' do
        it 'calls click_and_hold, move_by and release with specified pointer' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_by)
          allow(builder).to receive(:release)
          right_by = 5
          left_by = 5

          builder.drag_and_drop_by(element, right_by, left_by, device: 'pointer')

          expect(builder).to have_received(:click_and_hold).with(element, device: 'pointer')
          expect(builder).to have_received(:move_by).with(right_by, left_by, device: 'pointer')
          expect(builder).to have_received(:release).with(device: 'pointer')
        end

        it 'calls click_and_hold, move_by and release with the supplied pointer by default' do
          allow(builder).to receive(:click_and_hold)
          allow(builder).to receive(:move_by)
          allow(builder).to receive(:release)
          right_by = 5
          left_by = 5

          builder.drag_and_drop_by(element, right_by, left_by)

          expect(builder).to have_received(:click_and_hold).with(element, device: nil)
          expect(builder).to have_received(:move_by).with(right_by, left_by, device: nil)
          expect(builder).to have_received(:release).with(device: nil)
        end

        it 'returns itself' do
          expect(builder.drag_and_drop_by(element, 5, 5)).to eq(builder)
        end
      end
    end
  end # WebDriver
end # Selenium
