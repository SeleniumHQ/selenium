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
        let(:press) { described_class.new(source, direction, button) }
        let(:opts) do
          {width: 0,
           height: 0,
           pressure: 0.5,
           tangential_pressure: 0.4,
           tilt_x: -40,
           tilt_y: -10,
           twist: 177,
           altitude_angle: 1.0,
           azimuth_angle: 0.5}
        end

        describe '#initialize' do
          it 'raises a ArgumentError if invalid button symbol' do
            expect { described_class.new(source, direction, :none) }.to raise_error(ArgumentError)
          end

          it 'raises a TypeError if source is not a PointerInput' do
            key = Interactions.key('key')
            expect { described_class.new(key, direction, 'wrong') }.to raise_error(TypeError)
          end

          it 'raises a TypeError if button is not a Symbol or Integer' do
            expect { described_class.new(source, direction, 'wrong') }.to raise_error(TypeError)
          end

          it 'raises an ArgumentError if button is negative' do
            expect { described_class.new(source, direction, -1) }.to raise_error(ArgumentError)
          end

          it 'accepts any positive integer' do
            expect { described_class.new(source, direction, 1141) }.not_to raise_error
          end

          it 'raises a ArgumentError if invalid direction' do
            expect { described_class.new(source, :none, button) }.to raise_error(ArgumentError)
          end
        end

        describe '#type' do
          it 'returns valid direction as type' do
            expect(press.type).to eq PointerPress::DIRECTIONS[direction]
          end
        end

        describe '#encode' do
          it 'processes opts' do
            press = described_class.new(source, direction, button, **opts)

            expect(press.encode).to eq('type' => PointerPress::DIRECTIONS[direction].to_s,
                                       'button' => 0,
                                       'width' => 0,
                                       'height' => 0,
                                       'pressure' => 0.5,
                                       'tangentialPressure' => 0.4,
                                       'tiltX' => -40,
                                       'tiltY' => -10,
                                       'twist' => 177,
                                       'altitudeAngle' => 1.0,
                                       'azimuthAngle' => 0.5)
          end

          it 'returns a Hash with type and button' do
            expect(press.encode).to eq('type' => PointerPress::DIRECTIONS[direction].to_s,
                                       'button' => 0)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
