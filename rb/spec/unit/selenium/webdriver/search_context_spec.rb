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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe SearchContext do
      let(:test_search_context) do
        Class.new do
          attr_reader :bridge, :ref

          include Selenium::WebDriver::SearchContext

          def initialize(bridge)
            @bridge = bridge
          end
        end
      end

      let(:element)        { instance_double(Element) }
      let(:bridge)         { instance_double('Bridge').as_null_object }
      let(:search_context) { test_search_context.new(bridge) }

      context 'finding a single element' do
        it 'accepts a hash' do
          allow(bridge).to receive(:find_element_by).with('id', 'bar', nil).and_return(element)

          expect(search_context.find_element(id: 'bar')).to eq(element)
          expect(bridge).to have_received(:find_element_by).with('id', 'bar', nil)
        end

        it 'accepts two arguments' do
          allow(bridge).to receive(:find_element_by).with('id', 'bar', nil).and_return(element)

          expect(search_context.find_element(:id, 'bar')).to eq(element)
          expect(bridge).to have_received(:find_element_by).with('id', 'bar', nil)
        end

        it "raises an error if given an invalid 'by'" do
          expect {
            search_context.find_element(foo: 'bar')
          }.to raise_error(ArgumentError, 'cannot find element by :foo')
        end

        it 'does not modify the hash given' do
          selector = {id: 'foo'}

          search_context.find_element(selector)

          expect(selector).to eq(id: 'foo')
        end
      end

      context 'finding multiple elements' do
        it 'accepts a hash' do
          allow(bridge).to receive(:find_elements_by).with('id', 'bar', nil).and_return([])

          expect(search_context.find_elements(id: 'bar')).to eq([])
          expect(bridge).to have_received(:find_elements_by).with('id', 'bar', nil)
        end

        it 'accepts two arguments' do
          allow(bridge).to receive(:find_elements_by).with('id', 'bar', nil).and_return([])

          expect(search_context.find_elements(:id, 'bar')).to eq([])
          expect(bridge).to have_received(:find_elements_by).with('id', 'bar', nil)
        end

        it "raises an error if given an invalid 'by'" do
          expect {
            search_context.find_elements(foo: 'bar')
          }.to raise_error(ArgumentError, 'cannot find elements by :foo')
        end
      end
    end
  end # WebDriver
end # Selenium
