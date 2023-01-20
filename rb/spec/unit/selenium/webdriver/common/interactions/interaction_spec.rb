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
      class NewDevice < InputDevice
        def initialize(name = nil)
          super
          @type = :special
        end

        def create_special(val)
          add_action(NewInteraction.new(self, val))
        end
      end

      class NewInteraction < Interaction
        def initialize(source, special)
          super(source)
          @special = special
          @type = :newType
        end

        def assert_source(source)
          raise TypeError, "#{source.type} is not a valid input type" unless source.is_a? NewDevice
        end

        def encode
          {type: type, special: @special}
        end
      end

      class SubActionBuilder < ActionBuilder
        def special_action(special, device: nil)
          special_input(device).create_special(special)
          self
        end

        private

        def special_input(name = nil)
          device(name: name, type: :newType) || add_input(NewDevice.new('new'))
        end
      end

      describe Interaction do
        it 'can create subclass' do
          bridge = instance_double(Remote::Bridge)
          allow(bridge).to receive(:send_actions)
          sub_action_builder = SubActionBuilder.new(bridge)
          sub_action_builder.special_action('special').perform

          expect(bridge).to have_received(:send_actions).with([{type: :special,
                                                                id: 'new',
                                                                actions: [{type: :newType,
                                                                           special: 'special'}]}])
        end

        it 'raises a NotImplementedError if not a subclass' do
          expect { described_class.new(NoneInput.new) }.to raise_error(NotImplementedError)
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
