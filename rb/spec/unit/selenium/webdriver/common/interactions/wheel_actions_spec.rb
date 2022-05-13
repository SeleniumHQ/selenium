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
    describe WheelActions do
      let(:wheel) { Interactions.wheel('wheel') }
      let(:bridge) { instance_double(Remote::Bridge).as_null_object }
      let(:builder) { ActionBuilder.new(bridge, devices: [wheel]) }
      let(:duration) { builder.default_move_duration }
      let(:element) { Element.new(bridge, 'element') }

      describe '#wheel_input' do
        it 'gets key input by name' do
          expect(builder.send(:wheel_input, wheel.name)).to eq wheel
        end

        it 'raises ArgumentError if no device exists with that name' do
          expect { builder.send(:wheel_input, 'none') }.to raise_error(ArgumentError)
        end

        it 'gets default pointer input' do
          expect(builder.send(:wheel_input)).to eq wheel
        end

        it 'creates wheel input if none is available' do
          action_builder = ActionBuilder.new(bridge)
          expect(action_builder.send(:wheel_input)).to be_a(Interactions::WheelInput)
        end
      end

      describe '#scroll' do
        it 'gets wheel input' do
          allow(builder).to receive(:wheel_input).and_call_original

          builder.scroll_by 5, 5, device: wheel.name

          expect(builder).to have_received(:wheel_input).with(wheel.name)
        end

        it 'calls create_scroll with origin element offset' do
          allow(wheel).to receive(:create_scroll).and_call_original

          scroll_origin = WheelActions::ScrollOrigin.element(element, 10, 10)
          builder.scroll_from scroll_origin, 5, 5, device: wheel.name

          expect(wheel).to have_received(:create_scroll).with(duration: duration,
                                                              origin: element,
                                                              x: 10,
                                                              y: 10,
                                                              delta_x: 5,
                                                              delta_y: 5)
        end

        it 'calls create_scroll with origin viewport offset' do
          allow(wheel).to receive(:create_scroll).and_call_original

          scroll_origin = WheelActions::ScrollOrigin.viewport(-10, -10)
          builder.scroll_from scroll_origin, 5, 5, device: wheel.name

          expect(wheel).to have_received(:create_scroll).with(duration: duration,
                                                              origin: :viewport,
                                                              x: -10,
                                                              y: -10,
                                                              delta_x: 5,
                                                              delta_y: 5)
        end

        it 'passes the wheel to the #tick method' do
          allow(builder).to receive(:tick)

          builder.scroll_to(element)

          expect(builder).to have_received(:tick).with(wheel)
        end

        it 'returns itself' do
          expect(builder.scroll_to(element)).to eq(builder)
        end
      end
    end
  end # WebDriver
end # Selenium
