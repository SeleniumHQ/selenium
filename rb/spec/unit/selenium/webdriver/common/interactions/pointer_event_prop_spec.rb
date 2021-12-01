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
      describe PointerEventProperties do
        let(:pointer_event) do
          Class.new(Interaction) do
            include PointerEventProperties

            def initialize(opts)
              @opts = opts
            end

            def assert_source(*); end
          end
        end
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

        describe '#process_opts' do
          it 'validates all pointer event properties' do
            pointer = pointer_event.new(opts)
            allow(pointer).to receive(:assert_number)

            pointer.process_opts
            expect(pointer).to have_received(:assert_number).exactly(9).times
          end

          it 'validates subset of pointer event properties' do
            opts.delete :width
            opts.delete :tilt_x

            pointer = pointer_event.new(opts)
            allow(pointer).to receive(:assert_number)

            pointer.process_opts
            expect(pointer).to have_received(:assert_number).exactly(7).times
          end
        end

        describe '#assert_number' do
          context 'when Numeric' do
            let(:min) { 0.0 }
            let(:max) { 1 }

            it 'raises a TypeError if not a Number' do
              expect { pointer_event.new(opts).send(:assert_number, 'nan', min, max) }.to raise_error(TypeError)
            end

            it 'raises a ArgumentError if below minimum' do
              expect { pointer_event.new(nil).send(:assert_number, -max, min, max) }.to raise_error(ArgumentError)
            end

            it 'raises a ArgumentError if number above maximum' do
              expect { pointer_event.new(nil).send(:assert_number, max * 2, min, max) }.to raise_error(ArgumentError)
            end

            it 'returns number if minimum' do
              expect(pointer_event.new(nil).send(:assert_number, min, min, max)).to eq min
            end

            it 'returns number if maximum' do
              expect(pointer_event.new(nil).send(:assert_number, max, min, max)).to eq max
            end

            it 'returns number if no max provided' do
              expect(pointer_event.new(nil).send(:assert_number, max, min)).to eq max
            end
          end

          context 'when Integer' do
            let(:min) { 0 }
            let(:max) { 1 }

            it 'raises a TypeError if not an Integer' do
              expect { pointer_event.new(nil).send(:assert_number, 4.4, min, max) }.to raise_error(TypeError)
            end

            it 'raises a ArgumentError if below minimum' do
              expect { pointer_event.new(nil).send(:assert_number, -max, min, max) }.to raise_error(ArgumentError)
            end

            it 'raises a ArgumentError if number above maximum' do
              expect { pointer_event.new(nil).send(:assert_number, max * 2, min, max) }.to raise_error(ArgumentError)
            end

            it 'returns number if minimum' do
              expect(pointer_event.new(nil).send(:assert_number, min, min, max)).to eq min
            end

            it 'returns number if maximum' do
              expect(pointer_event.new(nil).send(:assert_number, max, min, max)).to eq max
            end
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
