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
      describe Interaction do
        let(:source) { instance_double(NoneInput) }
        let(:interaction) { Interaction.new(source) }

        it 'should provide access to source' do
          allow(source).to receive(:type).and_return(Interactions::NONE)
          expect(interaction).to respond_to(:source)
        end

        it 'should raise a TypeError if the type of the source device is not in Interactions::SOURCE_TYPES' do
          allow(source).to receive(:type).and_return(:no_type)
          expect { Interaction.new(source) }.to raise_error(TypeError)
        end
      end # Interaction

      describe Pause do
        let(:source) { instance_double(NoneInput) }
        let(:pause) { Pause.new(source) }
        let(:duration) { 5 }

        it 'should have a type of :pause' do
          allow(source).to receive(:type).and_return(Interactions::NONE)
          expect(pause.type).to eq(:pause)
        end

        context 'when encoding' do
          it 'should return a hash' do
            allow(source).to receive(:type).and_return(Interactions::NONE)
            expect(pause.encode).to be_a(Hash)
          end

          it 'should contain a type key with the value :pause' do
            allow(source).to receive(:type).and_return(Interactions::NONE)
            expect(pause.encode).to include(type: :pause)
          end

          it 'should not contain a duration key when duration is nil' do
            allow(source).to receive(:type).and_return(Interactions::NONE)
            expect(pause.encode).not_to include(:duration)
          end

          it 'should contain a duration key with the duration value multiplied by 1000 is not nil' do
            allow(source).to receive(:type).and_return(Interactions::NONE)
            expect(Pause.new(source, duration).encode).to include(duration: duration * 1000)
          end
        end # when encoding
      end # Pause
    end # Interactions
  end # WebDriver
end # Selenium
