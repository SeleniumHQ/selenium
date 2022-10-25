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
      describe Pause do
        let(:source) { NoneInput.new }
        let(:pause) { Pause.new(source) }
        let(:duration) { 5 }

        describe '#initialize' do
          it 'accepts key input' do
            key = Interactions.key('key')
            expect { Pause.new(key) }.not_to raise_error
          end

          it 'accepts pointer input' do
            mouse = Interactions.pointer(:mouse)
            expect { Pause.new(mouse) }.not_to raise_error
          end
        end

        describe '#type' do
          it 'returns :pause' do
            expect(pause.type).to eq(:pause)
          end
        end

        describe '#encode' do
          it 'returns Hash with type' do
            expect(pause.encode).to eq(type: :pause)
          end

          it 'returns Hash with duration in ms if provided' do
            expect(Pause.new(source, duration).encode).to include(duration: duration * 1000)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
