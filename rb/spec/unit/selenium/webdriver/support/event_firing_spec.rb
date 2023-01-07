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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    module Support
      describe EventFiringBridge do
        let(:bridge) { instance_double(Remote::Bridge) }
        let(:listener) { instance_double(AbstractEventListener) }
        let(:event_firing_bridge) { described_class.new(bridge, listener) }
        let(:driver) { Driver.new(bridge: event_firing_bridge) }
        let(:element) { Element.new(event_firing_bridge, 'ref') }

        before { allow(bridge).to receive(:browser) }

        context 'when navigating' do
          it 'fires events for navigate.to' do
            url = 'http://example.com'

            allow(listener).to receive(:before_navigate_to)
            allow(bridge).to receive(:get)
            allow(listener).to receive(:after_navigate_to)

            driver.navigate.to(url)

            expect(listener).to have_received(:before_navigate_to).with(url, instance_of(Driver))
            expect(bridge).to have_received(:get).with(url)
            expect(listener).to have_received(:after_navigate_to).with(url, instance_of(Driver))
          end

          it 'fires events for navigate.back' do
            allow(listener).to receive(:before_navigate_back)
            allow(bridge).to receive(:go_back)
            allow(listener).to receive(:after_navigate_back)

            driver.navigate.back

            expect(listener).to have_received(:before_navigate_back).with instance_of(Driver)
            expect(bridge).to have_received(:go_back)
            expect(listener).to have_received(:after_navigate_back).with instance_of(Driver)
          end

          it 'fires events for navigate.forward' do
            allow(listener).to receive(:before_navigate_forward)
            allow(bridge).to receive(:go_forward)
            allow(listener).to receive(:after_navigate_forward)

            driver.navigate.forward

            expect(listener).to have_received(:before_navigate_forward).with instance_of(Driver)
            expect(bridge).to have_received(:go_forward)
            expect(listener).to have_received(:after_navigate_forward).with instance_of(Driver)
          end
        end

        context 'when finding elements' do
          it 'fires events for find_element' do
            allow(listener).to receive(:before_find)
            allow(bridge).to receive(:find_element_by).and_return(element)
            allow(listener).to receive(:after_find)

            driver.find_element(id: 'foo')

            expect(listener).to have_received(:before_find).with('id', 'foo', instance_of(Driver))
            expect(bridge).to have_received(:find_element_by).with('id', 'foo', [:driver, nil])
            expect(listener).to have_received(:after_find).with('id', 'foo', instance_of(Driver))
          end

          it 'fires events for find_elements' do
            allow(listener).to receive(:before_find)
            allow(bridge).to receive(:find_elements_by).and_return([element])
            allow(listener).to receive(:after_find)

            driver.find_elements(class: 'foo')

            expect(listener).to have_received(:before_find).with('class name', 'foo', instance_of(Driver))
            expect(bridge).to have_received(:find_elements_by).with('class name', 'foo', [:driver, nil])
            expect(listener).to have_received(:after_find).with('class name', 'foo', instance_of(Driver))
          end
        end

        context 'when changing elements' do
          it 'fires events for send_keys' do
            allow(listener).to receive(:before_change_value_of)
            allow(bridge).to receive(:send_keys_to_element)
            allow(listener).to receive(:after_change_value_of)

            element.send_keys 'cheese'

            expect(listener).to have_received(:before_change_value_of).with(instance_of(Element), instance_of(Driver))
            expect(bridge).to have_received(:send_keys_to_element).with('ref', ['cheese'])
            expect(listener).to have_received(:after_change_value_of).with(instance_of(Element), instance_of(Driver))
          end

          it 'fires events for clear' do
            allow(listener).to receive(:before_change_value_of)
            allow(bridge).to receive(:clear_element)
            allow(listener).to receive(:after_change_value_of)

            element.clear

            expect(listener).to have_received(:before_change_value_of).with(instance_of(Element), instance_of(Driver))
            expect(bridge).to have_received(:clear_element).with('ref')
            expect(listener).to have_received(:after_change_value_of).with(instance_of(Element), instance_of(Driver))
          end
        end

        context 'when executing scripts' do
          it 'fires events for execute_script' do
            allow(listener).to receive(:before_execute_script)
            allow(bridge).to receive(:execute_script)
            allow(listener).to receive(:after_execute_script)

            script = 'script'
            arg = 'arg'
            driver.execute_script script, arg

            expect(listener).to have_received(:before_execute_script).with(script, instance_of(Driver))
            expect(bridge).to have_received(:execute_script).with(script, arg)
            expect(listener).to have_received(:after_execute_script).with(script, instance_of(Driver))
          end
        end

        context 'when closing and quitting' do
          it 'fires events for close' do
            allow(listener).to receive(:before_close)
            allow(bridge).to receive(:close)
            allow(listener).to receive(:after_close)

            driver.close

            expect(listener).to have_received(:before_close).with instance_of(Driver)
            expect(bridge).to have_received(:close)
            expect(listener).to have_received(:after_close).with instance_of(Driver)
          end

          it 'fires events for quit' do
            allow(listener).to receive(:before_quit)
            allow(bridge).to receive(:quit)
            allow(listener).to receive(:after_quit)

            driver.quit

            expect(listener).to have_received(:before_quit).with instance_of(Driver)
            expect(bridge).to have_received(:quit)
            expect(listener).to have_received(:after_quit).with instance_of(Driver)
          end
        end
      end
    end # Support
  end # WebDriver
end # Selenium
