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
      describe WheelInput do
        let(:wheel) { described_class.new(name: :name) }
        let(:origin) { :viewport }
        let(:duration) { 0.5 }
        let(:x) { 25 }
        let(:y) { 50 }
        let(:delta_x) { 30 }
        let(:delta_y) { 60 }
        let(:scroll) do
          Scroll.new(source: wheel, duration: duration, delta_x: delta_x, delta_y: delta_y, origin: origin, x: x, y: y)
        end

        describe '#type' do
          it 'returns :wheel' do
            expect(wheel.type).to eq(:wheel)
          end
        end

        describe '#create_scroll' do
          it 'executes #add_action with created interaction' do
            allow(Scroll).to receive(:new).with(source: wheel,
                                                duration: duration,
                                                delta_x: delta_x,
                                                delta_y: delta_y,
                                                origin: origin,
                                                x: x,
                                                y: y)
                                          .and_return(scroll)
            allow(wheel).to receive(:add_action).and_call_original

            wheel.create_scroll(duration: duration, x: x, y: y, delta_x: delta_x, delta_y: delta_y, origin: origin)

            expect(wheel).to have_received(:add_action).with(scroll)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
