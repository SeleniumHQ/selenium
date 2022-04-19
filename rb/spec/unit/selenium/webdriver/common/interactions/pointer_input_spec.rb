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
      describe PointerInput do
        let(:kind) { PointerInput::KIND[:mouse] }
        let(:pointer) { PointerInput.new(kind, name: :name) }
        let(:interaction) { PointerCancel.new(pointer) }

        describe '#initialize' do
          it 'raises TypeError if kind is not recognized' do
            expect { PointerInput.new(:none) }.to raise_error(TypeError)
          end
        end

        describe '#type' do
          it 'returns :pointer' do
            expect(pointer.type).to eq(:pointer)
          end
        end

        describe '#kind' do
          it 'returns value' do
            expect(pointer.kind).to eq kind
          end
        end

        describe '#encode' do
          it 'returns nil if no actions' do
            expect(pointer.encode).to eq(nil)
          end

          it 'encodes each action' do
            allow(interaction).to receive(:encode).and_call_original
            2.times { pointer.add_action(interaction) }

            pointer.encode

            expect(interaction).to have_received(:encode).twice
          end
        end

        describe '#create_pointer_move' do
          it 'executes #add_action with created interaction' do
            allow(PointerMove).to receive(:new).with(pointer, 50, 51, 52, origin: nil)
                                               .and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_move(duration: 50, x: 51, y: 52)

            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_pointer_down' do
          it 'executes #add_action with created interaction' do
            allow(PointerPress).to receive(:new).and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_down(:left)

            expect(PointerPress).to have_received(:new).with(pointer, :down, :left)
            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_pointer_up' do
          it 'executes #add_action with created interaction' do
            allow(PointerPress).to receive(:new).and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_up(:left)

            expect(PointerPress).to have_received(:new).with(pointer, :up, :left)
            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end

        describe '#create_pointer_cancel' do
          it 'executes #add_action with created interaction' do
            allow(PointerCancel).to receive(:new).with(pointer).and_return(interaction)
            allow(pointer).to receive(:add_action).and_call_original

            pointer.create_pointer_cancel

            expect(pointer).to have_received(:add_action).with(interaction)
          end
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
