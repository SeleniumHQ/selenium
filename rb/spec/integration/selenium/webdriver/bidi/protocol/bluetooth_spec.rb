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

require_relative '../../spec_helper'
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Bluetooth,
                 pending_if: [{browser: :firefox,
                               exception: {class: Error::UnknownCommandError,
                                           message: /(?:Module bluetooth does not exist|bluetooth\.)/},
                               reason: 'Firefox returns unknown command for BiDi Bluetooth simulation'},
                              {browser_family: :safari,
                               exception: {class: Error::UnknownCommandError,
                                           message: /(?:Module bluetooth does not exist|bluetooth\.)/},
                               reason: 'Safari returns unknown command for BiDi Bluetooth simulation'}],
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after do |example|
            next if example.metadata[:skip] || example.skip

            begin
              bluetooth.disable_simulation(context: driver.window_handle)
            rescue StandardError
              nil
            end
            reset_driver!(example: example)
          end

          let(:bluetooth) { described_class.new(driver) }
          let(:script) { Script.new(driver) }
          let(:session) { Session.new(driver) }

          def target
            Script::ContextTarget.new(context: driver.window_handle)
          end

          def address
            '00:11:22:33:44:55'
          end

          def service_uuid
            '0000180d-0000-1000-8000-00805f9b34fb'
          end

          def characteristic_uuid
            '00002a37-0000-1000-8000-00805f9b34fb'
          end

          def descriptor_uuid
            '00002902-0000-1000-8000-00805f9b34fb'
          end

          def manufacturer_data
            [Bluetooth::BluetoothManufacturerData.new(key: 1, data: 'AQID')]
          end

          def scan_record
            Bluetooth::ScanRecord.new(
              name: 'Ruby Heart Rate',
              uuids: [service_uuid],
              appearance: 832,
              manufacturer_data: manufacturer_data
            )
          end

          def scan_entry
            Bluetooth::SimulateAdvertisementScanEntryParameters.new(
              device_address: address,
              rssi: -60,
              scan_record: scan_record
            )
          end

          def enable_adapter
            driver.navigate.to url_for('blank.html')
            bluetooth.simulate_adapter(context: driver.window_handle, state: :powered_on, le_supported: true)
          end

          def simulate_preconnected_device
            enable_adapter
            bluetooth.simulate_preconnected_peripheral(
              context: driver.window_handle,
              address: address,
              name: 'Ruby Heart Rate',
              manufacturer_data: manufacturer_data,
              known_service_uuids: [service_uuid]
            )
          end

          def subscribe(event)
            events = []
            callback = driver.bidi.add_callback(event) { |params| events << params }
            session.subscribe(events: [event])
            [events, callback]
          end

          def unsubscribe(event, callback)
            begin
              session.unsubscribe(events: [event])
            rescue StandardError
              nil
            end
          ensure
            driver.bidi.remove_callback(event, callback) if callback
          end

          def evaluate_value(expression, await_promise: false, user_activation: WebDriver::BiDi::Serialization::UNSET)
            result = script.evaluate(
              expression: expression,
              target: target,
              await_promise: await_promise,
              user_activation: user_activation
            ).result
            result.respond_to?(:value) ? result.value : nil
          end

          def start_request_device
            evaluate_value(
              <<~JS,
                (() => {
                  window.__rubyBluetoothDevicePromise = navigator.bluetooth.requestDevice({
                    filters: [{services: [#{service_uuid.inspect}]}]
                  }).then(device => {
                    window.__rubyBluetoothDevice = device;
                    return device.name;
                  }).catch(error => `ERROR:${error.name}`);
                  return 'started';
                })()
              JS
              user_activation: true
            )
          end

          def request_device_prompt(events)
            wait.until do
              events.find do |event|
                Array(event['devices']).any? { |device| device['name'] == 'Ruby Heart Rate' }
              end
            end
          end

          def advertised_device(prompt)
            prompt['devices'].find { |device| device['name'] == 'Ruby Heart Rate' }
          end

          def select_device
            events, callback = subscribe('bluetooth.requestDevicePromptUpdated')
            enable_adapter
            start_request_device

            expect(bluetooth.simulate_advertisement(
                     context: driver.window_handle,
                     scan_entry: scan_entry
                   )).to be_empty

            prompt = request_device_prompt(events)
            device = advertised_device(prompt)
            expect(device['id']).to be_a(String)

            bluetooth.handle_request_device_prompt(
              context: driver.window_handle,
              prompt: prompt['prompt'],
              accept: true,
              device: device['id']
            )
            expect(evaluate_value('window.__rubyBluetoothDevicePromise', await_promise: true)).to eq('Ruby Heart Rate')
          ensure
            unsubscribe('bluetooth.requestDevicePromptUpdated', callback) if callback
          end

          def start_gatt_connection
            evaluate_value(
              <<~JS
                (() => {
                  window.__rubyBluetoothGattPromise = window.__rubyBluetoothDevice.gatt.connect()
                    .then(server => server.connected)
                    .catch(error => `ERROR:${error.name}`);
                  return 'started';
                })()
              JS
            )
          end

          def connect_selected_device
            events, callback = subscribe('bluetooth.gattConnectionAttempted')
            start_gatt_connection
            attempt = wait.until { events.find { |event| event['address'] == address } }

            expect(attempt['context']).to eq(driver.window_handle)
            expect(bluetooth.simulate_gatt_connection_response(
                     context: driver.window_handle,
                     address: address,
                     code: 0
                   )).to be_empty
            expect(evaluate_value('window.__rubyBluetoothGattPromise', await_promise: true)).to be(true)
          ensure
            unsubscribe('bluetooth.gattConnectionAttempted', callback) if callback
          end

          def store_primary_service
            evaluate_value(
              <<~JS,
                window.__rubyBluetoothDevice.gatt.getPrimaryService(#{service_uuid.inspect})
                  .then(service => {
                    window.__rubyBluetoothService = service;
                    return service.uuid;
                  })
              JS
              await_promise: true
            )
          end

          def store_characteristic
            evaluate_value(
              <<~JS,
                window.__rubyBluetoothService.getCharacteristic(#{characteristic_uuid.inspect})
                  .then(characteristic => {
                    window.__rubyBluetoothCharacteristic = characteristic;
                    return characteristic.uuid;
                  })
              JS
              await_promise: true
            )
          end

          def store_descriptor
            evaluate_value(
              <<~JS,
                window.__rubyBluetoothCharacteristic.getDescriptor(#{descriptor_uuid.inspect})
                  .then(descriptor => {
                    window.__rubyBluetoothDescriptor = descriptor;
                    return descriptor.uuid;
                  })
              JS
              await_promise: true
            )
          end

          def add_service
            bluetooth.simulate_service(context: driver.window_handle, address: address, uuid: service_uuid, type: :add)
          end

          def add_characteristic
            properties = Bluetooth::CharacteristicProperties.new(read: true, write: true, notify: true)
            bluetooth.simulate_characteristic(
              context: driver.window_handle,
              address: address,
              service_uuid: service_uuid,
              characteristic_uuid: characteristic_uuid,
              type: :add,
              characteristic_properties: properties
            )
          end

          def add_descriptor
            bluetooth.simulate_descriptor(
              context: driver.window_handle,
              address: address,
              service_uuid: service_uuid,
              characteristic_uuid: characteristic_uuid,
              descriptor_uuid: descriptor_uuid,
              type: :add
            )
          end

          describe '#handle_request_device_prompt' do
            it 'accepts a prompt' do
              select_device

              expect(evaluate_value('window.__rubyBluetoothDevice.name')).to eq('Ruby Heart Rate')
            end

            it 'cancels a prompt' do
              events, callback = subscribe('bluetooth.requestDevicePromptUpdated')
              enable_adapter
              start_request_device

              expect(bluetooth.simulate_advertisement(
                       context: driver.window_handle,
                       scan_entry: scan_entry
                     )).to be_empty

              prompt = request_device_prompt(events)
              bluetooth.handle_request_device_prompt(
                context: driver.window_handle,
                prompt: prompt['prompt'],
                accept: false
              )
              expect(evaluate_value('window.__rubyBluetoothDevicePromise', await_promise: true)).to start_with('ERROR:')
            ensure
              unsubscribe('bluetooth.requestDevicePromptUpdated', callback) if callback
            end
          end

          describe '#simulate_adapter' do
            it 'simulates a powered-on adapter' do
              expect(enable_adapter).to be_empty
            end
          end

          describe '#disable_simulation' do
            it 'disables active Bluetooth simulation' do
              enable_adapter

              expect(bluetooth.disable_simulation(context: driver.window_handle)).to be_empty
            end
          end

          describe '#simulate_preconnected_peripheral' do
            it 'simulates a preconnected peripheral' do
              expect(simulate_preconnected_device).to be_empty
            end
          end

          describe '#simulate_advertisement' do
            it 'simulates an advertisement scan entry' do
              events, callback = subscribe('bluetooth.requestDevicePromptUpdated')
              enable_adapter
              start_request_device

              expect(bluetooth.simulate_advertisement(
                       context: driver.window_handle,
                       scan_entry: scan_entry
                     )).to be_empty

              prompt = request_device_prompt(events)
              expect(advertised_device(prompt)['id']).to be_a(String)
            ensure
              unsubscribe('bluetooth.requestDevicePromptUpdated', callback) if callback
            end
          end

          describe '#simulate_gatt_connection_response' do
            it 'simulates a successful GATT connection response' do
              select_device

              connect_selected_device
              expect(evaluate_value('window.__rubyBluetoothDevice.gatt.connected')).to be(true)
            end
          end

          describe '#simulate_gatt_disconnection' do
            it 'simulates a GATT disconnection' do
              select_device
              connect_selected_device

              expect(bluetooth.simulate_gatt_disconnection(
                       context: driver.window_handle,
                       address: address
                     )).to be_empty
              wait.until { evaluate_value('window.__rubyBluetoothDevice.gatt.connected') == false }
            end
          end

          describe '#simulate_service' do
            it 'adds and removes a simulated service' do
              simulate_preconnected_device

              expect(bluetooth.simulate_service(
                       context: driver.window_handle,
                       address: address,
                       uuid: service_uuid,
                       type: :add
                     )).to be_empty
              expect(bluetooth.simulate_service(
                       context: driver.window_handle,
                       address: address,
                       uuid: service_uuid,
                       type: :remove
                     )).to be_empty
            end
          end

          describe '#simulate_characteristic' do
            it 'adds and removes a characteristic with properties' do
              simulate_preconnected_device
              add_service
              properties = Bluetooth::CharacteristicProperties.new(read: true, write: true, notify: true)

              expect(bluetooth.simulate_characteristic(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       type: :add,
                       characteristic_properties: properties
                     )).to be_empty
              expect(bluetooth.simulate_characteristic(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       type: :remove
                     )).to be_empty
            end
          end

          describe '#simulate_characteristic_response' do
            it 'simulates characteristic read and write responses' do
              select_device
              add_service
              add_characteristic
              connect_selected_device
              store_primary_service
              store_characteristic

              events, callback = subscribe('bluetooth.characteristicEventGenerated')
              evaluate_value(
                <<~JS
                  (() => {
                    window.__rubyBluetoothReadPromise = window.__rubyBluetoothCharacteristic.readValue()
                      .then(value => Array.from(new Uint8Array(value.buffer)).join(','))
                      .catch(error => `ERROR:${error.name}`);
                    return 'started';
                  })()
                JS
              )
              wait.until { events.find { |event| event['type'] == 'read' } }
              expect(bluetooth.simulate_characteristic_response(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       type: :read,
                       code: 0,
                       data: [1, 2, 3]
                     )).to be_empty
              expect(evaluate_value('window.__rubyBluetoothReadPromise', await_promise: true)).to eq('1,2,3')

              evaluate_value(
                <<~JS
                  (() => {
                    window.__rubyBluetoothWritePromise = window.__rubyBluetoothCharacteristic
                      .writeValueWithResponse(new Uint8Array([4, 5]))
                      .then(() => 'written')
                      .catch(error => `ERROR:${error.name}`);
                    return 'started';
                  })()
                JS
              )
              wait.until { events.find { |event| event['type'] == 'write-with-response' } }
              expect(bluetooth.simulate_characteristic_response(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       type: :write,
                       code: 0
                     )).to be_empty
              expect(evaluate_value('window.__rubyBluetoothWritePromise', await_promise: true)).to eq('written')
            ensure
              unsubscribe('bluetooth.characteristicEventGenerated', callback) if callback
            end
          end

          describe '#simulate_descriptor' do
            it 'adds and removes a descriptor' do
              simulate_preconnected_device
              add_service
              add_characteristic

              expect(bluetooth.simulate_descriptor(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       descriptor_uuid: descriptor_uuid,
                       type: :add
                     )).to be_empty
              expect(bluetooth.simulate_descriptor(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       descriptor_uuid: descriptor_uuid,
                       type: :remove
                     )).to be_empty
            end
          end

          describe '#simulate_descriptor_response' do
            it 'simulates descriptor read and write responses' do
              select_device
              add_service
              add_characteristic
              add_descriptor
              connect_selected_device
              store_primary_service
              store_characteristic
              store_descriptor

              events, callback = subscribe('bluetooth.descriptorEventGenerated')
              evaluate_value(
                <<~JS
                  (() => {
                    window.__rubyBluetoothDescriptorReadPromise = window.__rubyBluetoothDescriptor.readValue()
                      .then(value => Array.from(new Uint8Array(value.buffer)).join(','))
                      .catch(error => `ERROR:${error.name}`);
                    return 'started';
                  })()
                JS
              )
              wait.until { events.find { |event| event['type'] == 'read' } }
              expect(bluetooth.simulate_descriptor_response(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       descriptor_uuid: descriptor_uuid,
                       type: :read,
                       code: 0,
                       data: [1, 2]
                     )).to be_empty
              expect(evaluate_value('window.__rubyBluetoothDescriptorReadPromise', await_promise: true)).to eq('1,2')

              evaluate_value(
                <<~JS
                  (() => {
                    window.__rubyBluetoothDescriptorWritePromise = window.__rubyBluetoothDescriptor
                      .writeValue(new Uint8Array([6, 7]))
                      .then(() => 'written')
                      .catch(error => `ERROR:${error.name}`);
                    return 'started';
                  })()
                JS
              )
              wait.until { events.find { |event| event['type'] == 'write' } }
              expect(bluetooth.simulate_descriptor_response(
                       context: driver.window_handle,
                       address: address,
                       service_uuid: service_uuid,
                       characteristic_uuid: characteristic_uuid,
                       descriptor_uuid: descriptor_uuid,
                       type: :write,
                       code: 0
                     )).to be_empty
              expect(evaluate_value('window.__rubyBluetoothDescriptorWritePromise',
                                    await_promise: true)).to eq('written')
            ensure
              unsubscribe('bluetooth.descriptorEventGenerated', callback) if callback
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
