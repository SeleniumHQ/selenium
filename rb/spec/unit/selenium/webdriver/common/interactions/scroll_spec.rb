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
      describe Scroll do
        let(:source) { Interactions.wheel('scroll') }
        let(:element) { instance_double(Element) }
        let(:origin) { :viewport }
        let(:duration) { 0.5 }
        let(:x) { 25 }
        let(:y) { 50 }
        let(:delta_x) { 30 }
        let(:delta_y) { 60 }
        let(:scroll) do
          described_class.new(source: source,
                              duration: duration,
                              delta_x: delta_x,
                              delta_y: delta_y,
                              origin: origin,
                              x: x,
                              y: y)
        end

        describe '#initialize' do
          it 'raises a TypeError if source is not a Wheel' do
            key = Interactions.key('key')
            expect { described_class.new(source: key) }.to raise_error(TypeError)
          end
        end

        describe '#type' do
          it 'equals :scroll' do
            expect(scroll.type).to eq(:scroll)
          end
        end

        describe '#encode' do
          context 'with element' do
            it 'returns a Hash with source, duration, x and y' do
              scroll = described_class.new(source: source,
                                           duration: duration,
                                           delta_x: delta_x,
                                           delta_y: delta_y,
                                           origin: element,
                                           x: x,
                                           y: y)
              allow(element).to receive(:is_a?).with(Element).and_return(true)

              expect(scroll.encode).to eq('type' => 'scroll',
                                          'origin' => element,
                                          'duration' => (duration * 1000).to_i,
                                          'x' => x,
                                          'y' => y,
                                          'deltaX' => delta_x,
                                          'deltaY' => delta_y)
            end
          end

          context 'with viewport origin' do
            it 'returns a Hash valid attributes' do
              expect(scroll.encode).to eq('type' => 'scroll',
                                          'origin' => 'viewport',
                                          'duration' => (duration * 1000).to_i,
                                          'x' => x,
                                          'y' => y,
                                          'deltaX' => delta_x,
                                          'deltaY' => delta_y)
            end
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
