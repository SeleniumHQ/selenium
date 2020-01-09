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
      describe NoneInput do
        let(:none) { NoneInput.new(:name) }

        it 'should have a type of :none' do
          expect(none.type).to eq(:none)
        end

        context 'when encoding' do
          it 'should return nil if no_actions? is true' do
            allow(none).to receive(:no_actions?).and_return(true)
            expect(none.encode).to eq(nil)
          end

          it 'should return a hash if no_actions? is false' do
            allow(none).to receive(:no_actions?).and_return(false)
            expect(none.encode).to be_a(Hash)
          end

          it 'should contain a type key with the value :none' do
            allow(none).to receive(:no_actions?).and_return(false)
            expect(none.encode).to include(type: :none)
          end

          it 'should contain an id key with the name of the input' do
            allow(none).to receive(:no_actions?).and_return(false)
            expect(none.encode).to include(id: none.name)
          end

          it 'should call the #encode method on all actions' do
            allow(none).to receive(:no_actions?).and_return(false)
            2.times { none.create_pause }
            act1, act2 = none.actions
            expect(act1).to receive(:encode)
            expect(act2).to receive(:encode)
            none.encode
          end

          it 'should contain an actions key with an array of actions' do
            allow(none).to receive(:no_actions?).and_return(false)
            expect(none.actions).to receive(:map).and_return([1, 2, 3])
            expect(none.encode).to include(actions: [1, 2, 3])
          end
        end # when encoding
      end # NoneInput
    end # Interactions
  end # WebDriver
end # Selenium
