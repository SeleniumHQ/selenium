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
    describe Interactions do
      describe '#key' do
        it 'creates a new key input with provided name' do
          device = described_class.key(:name)

          expect(device).to be_a(Interactions::KeyInput)
          expect(device.name).to eq(:name)
        end

        it 'sets name to a random UUID if no name is provided' do
          allow(SecureRandom).to receive(:uuid).and_return(:id)

          device = described_class.key

          expect(device).to be_a(Interactions::KeyInput)
          expect(device.name).to eq(:id)
        end
      end

      describe '#pointer' do
        it 'creates a new pointer input with a provided name' do
          device = described_class.pointer(:mouse, name: :name)

          expect(device).to be_a(Interactions::PointerInput)
          expect(device.name).to eq(:name)
        end

        it 'sets name to a random UUID if no name is provided' do
          allow(SecureRandom).to receive(:uuid).and_return(:id)

          device = described_class.pointer(:mouse)

          expect(device).to be_a(Interactions::PointerInput)
          expect(device.name).to eq(:id)
        end
      end

      describe '#none' do
        it 'creates a new pointer input with a provided name' do
          device = described_class.none(:name)

          expect(device).to be_a(Interactions::NoneInput)
          expect(device.name).to eq(:name)
        end

        it 'sets name to a random UUID if no name is provided' do
          allow(SecureRandom).to receive(:uuid).and_return(:id)

          device = described_class.none

          expect(device).to be_a(Interactions::NoneInput)
          expect(device.name).to eq(:id)
        end
      end
    end
  end # WebDriver
end # Selenium
