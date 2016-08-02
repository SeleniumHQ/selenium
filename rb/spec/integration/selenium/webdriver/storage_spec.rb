# encoding: utf-8
#
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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    module DriverExtensions
      describe HasWebStorage do
        compliant_on browser: [:chrome, :firefox] do
          shared_examples_for 'web storage' do
            before do
              driver.navigate.to url_for('clicks.html')
              storage.clear
            end

            it 'can get and set items' do
              expect(storage).to be_empty
              storage['foo'] = 'bar'
              expect(storage['foo']).to eq('bar')

              storage['foo1'] = 'bar1'
              expect(storage['foo1']).to eq('bar1')

              expect(storage.size).to eq(2)
            end

            it 'can get all keys' do
              storage['foo1'] = 'bar1'
              storage['foo2'] = 'bar2'
              storage['foo3'] = 'bar3'

              expect(storage.size).to eq(3)
              expect(storage.keys).to include('foo1', 'foo2', 'foo3')
            end

            it 'can clear all items' do
              storage['foo1'] = 'bar1'
              storage['foo2'] = 'bar2'
              storage['foo3'] = 'bar3'

              expect(storage.size).to eq(3)
              storage.clear
              expect(storage.size).to eq(0)
              expect(storage.keys).to be_empty
            end

            it 'can delete an item' do
              storage['foo1'] = 'bar1'
              storage['foo2'] = 'bar2'
              storage['foo3'] = 'bar3'

              expect(storage.size).to eq(3)
              storage.delete('foo1')
              expect(storage.size).to eq(2)
            end

            it 'knows if a key is set' do
              expect(storage).not_to have_key('foo1')
              storage['foo1'] = 'bar1'
              expect(storage).to have_key('foo1')
            end

            it 'is Enumerable' do
              storage['foo1'] = 'bar1'
              storage['foo2'] = 'bar2'
              storage['foo3'] = 'bar3'

              expect(storage.to_a).to include(
                %w[foo1 bar1],
                %w[foo2 bar2],
                %w[foo3 bar3]
              )
            end

            it 'can fetch an item' do
              storage['foo1'] = 'bar1'
              expect(storage.fetch('foo1')).to eq('bar1')
            end

            it 'raises IndexError on missing key' do
              expect do
                storage.fetch('no-such-key')
              end.to raise_error(IndexError, /missing key/)
            end
          end

          context 'local storage' do
            let(:storage) { driver.local_storage }
            it_behaves_like 'web storage'
          end

          context 'session storage' do
            let(:storage) { driver.session_storage }
            it_behaves_like 'web storage'
          end
        end
      end
    end # DriverExtensions
  end # WebDriver
end # Selenium
