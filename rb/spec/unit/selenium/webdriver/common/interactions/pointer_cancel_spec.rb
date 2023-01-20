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
      describe PointerCancel do
        let(:pointer_cancel) { described_class.new(Interactions.pointer(:mouse)) }

        describe '#initialize' do
          it 'raises a TypeError if source is not a PointerInput' do
            key = Interactions.key('key')
            expect { described_class.new(key) }.to raise_error(TypeError)
          end
        end

        describe '#type' do
          it 'equals :pointerCancel' do
            expect(pointer_cancel.type).to eq(:pointerCancel)
          end
        end

        describe '#encode' do
          it 'returns a Hash with type' do
            expect(pointer_cancel.encode).to eq(type: pointer_cancel.type)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
