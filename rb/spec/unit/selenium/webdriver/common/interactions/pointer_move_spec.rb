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
      describe PointerMove do
        let(:source) { Interactions.pointer(:mouse) }
        let(:element) { instance_double(Element) }
        let(:origin) { PointerMove::POINTER }
        let(:duration) { 0.5 }
        let(:x) { 25 }
        let(:y) { 50 }
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
          it 'raises a TypeError if source is not a PointerInput' do
            key = Interactions.key('key')
            expect { described_class.new(key, duration, x, y) }.to raise_error(TypeError)
          end
        end

        describe '#type' do
          it 'equals :pointerMove' do
            move = described_class.new(source, duration, x, y)
            expect(move.type).to eq(:pointerMove)
          end
        end

        describe '#encode' do
          it 'processes opts' do
            move = described_class.new(source, duration, x, y, origin: element, **opts)

            expect(move.encode).to eq('type' => move.type.to_s,
                                      'origin' => element,
                                      'duration' => (duration * 1000).to_i,
                                      'x' => x,
                                      'y' => y,
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

          context 'with element' do
            it 'returns a Hash with source, duration, x and y' do
              move = described_class.new(source, duration, x, y, origin: element)

              ms = (duration * 1000).to_i
              expect(move.encode).to eq('type' => move.type.to_s,
                                        'origin' => element,
                                        'duration' => ms,
                                        'x' => x,
                                        'y' => y)
            end
          end

          context 'with origin' do
            it 'returns a Hash with source, duration, x and y' do
              move = described_class.new(source, duration, x, y, origin: :pointer)

              ms = (duration * 1000).to_i
              expect(move.encode).to eq('type' => move.type.to_s,
                                        'origin' => :pointer,
                                        'duration' => ms,
                                        'x' => x,
                                        'y' => y)
            end
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
