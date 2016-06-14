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

require File.expand_path('../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Support
      describe Select do
        let(:select) do
          double(Element, tag_name: 'select')
        end

        let(:multi_select) do
          s = double(Element, tag_name: 'select')
          allow(s).to receive(:attribute).with(:multiple).and_return 'multiple'

          s
        end

        it 'raises ArgumentError if passed a non-select Element' do
          link = double(Element, tag_name: 'a')

          expect do
            Select.new link
          end.to raise_error(ArgumentError)
        end

        it 'indicates whether a select is multiple correctly' do
          selects = [
            double(Element, tag_name: 'select'),
            double(Element, tag_name: 'select'),
            double(Element, tag_name: 'select'),
            double(Element, tag_name: 'select')
          ]

          allow(selects[0]).to receive(:attribute).with(:multiple).and_return('false')
          allow(selects[1]).to receive(:attribute).with(:multiple).and_return(nil)
          allow(selects[2]).to receive(:attribute).with(:multiple).and_return('true')
          allow(selects[3]).to receive(:attribute).with(:multiple).and_return('multiple')

          expect(Select.new(selects[0])).not_to be_multiple
          expect(Select.new(selects[1])).not_to be_multiple
          expect(Select.new(selects[2])).to be_multiple
          expect(Select.new(selects[3])).to be_multiple
        end

        it 'returns all options' do
          options = []

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .once
            .and_return(options)

          expect(Select.new(multi_select).options).to eql(options)
        end

        it 'returns all selected options' do
          bad_option  = double(Element, selected?: false)
          good_option = double(Element, selected?: true)

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .once
            .and_return([bad_option, good_option])

          opts = Select.new(multi_select).selected_options

          expect(opts.size).to eq(1)
          expect(opts.first).to eq(good_option)
        end

        it 'returns the first selected option' do
          first_option  = double(Element, selected?: true)
          second_option = double(Element, selected?: true)

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .once
            .and_return([first_option, second_option])

          option = Select.new(multi_select).first_selected_option
          expect(option).to eq(first_option)
        end

        it 'raises a NoSuchElementError if nothing is selected' do
          option = double(Element, selected?: false)

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .once
            .and_return([option])

          expect do
            Select.new(multi_select).first_selected_option
          end.to raise_error(Error::NoSuchElementError)
        end

        it 'allows options to be selected by visible text' do
          option = double(Element, selected?: false)

          expect(multi_select).to receive(:find_elements)
            .with(xpath: './/option[normalize-space(.) = "fish"]')
            .once
            .and_return([option])

          expect(option).to receive(:click).once

          Select.new(multi_select).select_by(:text, 'fish')
        end

        it 'allows options to be selected by index' do
          first_option = double(Element, selected?: true)
          second_option = double(Element, selected?: false)

          expect(first_option).to receive(:attribute).with(:index).and_return '0'
          expect(first_option).to receive(:click).never

          expect(second_option).to receive(:attribute).with(:index).and_return '1'
          expect(second_option).to receive(:click).once

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .and_return([first_option, second_option])

          Select.new(multi_select).select_by(:index, 1)
        end

        it 'allows options to be selected by returned value' do
          first_option = double(Element, selected?: false)
          expect(multi_select).to receive(:find_elements)
            .with(xpath: './/option[@value = "b"]')
            .and_return([first_option])

          expect(first_option).to receive(:click).once

          Select.new(multi_select).select_by(:value, 'b')
        end

        it 'can deselect all when select supports multiple selections' do
          first_option = double(Element, selected?: true)
          second_option = double(Element, selected?: false)

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .once
            .and_return([first_option, second_option])

          expect(first_option).to receive(:click).once
          expect(second_option).to receive(:click).never

          Select.new(multi_select).deselect_all
        end

        it 'can not deselect all when select does not support multiple selections' do
          expect(select).to receive(:attribute).with(:multiple).and_return nil

          expect do
            Select.new(select).deselect_all
          end.to raise_error(Error::UnsupportedOperationError)
        end

        it 'can deselect options by visible text' do
          first_option  = double(Element, selected?: true)
          second_option = double(Element, selected?: false)

          expect(multi_select).to receive(:find_elements)
            .with(xpath: './/option[normalize-space(.) = "b"]')
            .and_return([first_option, second_option])

          expect(first_option).to receive(:click).once
          expect(second_option).to receive(:click).never

          Select.new(multi_select).deselect_by(:text, 'b')
        end

        it 'can deselect options by index' do
          first_option  = double(Element, selected?: true)
          second_option = double(Element)

          expect(multi_select).to receive(:find_elements)
            .with(tag_name: 'option')
            .and_return([first_option, second_option])

          expect(first_option).to receive(:attribute).with(:index).and_return('2')
          expect(second_option).to receive(:attribute).with(:index).and_return('1')

          expect(first_option).to receive(:click).once
          expect(second_option).to receive(:click).never

          Select.new(multi_select).deselect_by(:index, 2)
        end

        it 'can deselect options by returned value' do
          first_option = double(Element, selected?: true)
          second_option = double(Element, selected?: false)

          expect(multi_select).to receive(:find_elements)
            .with(xpath: './/option[@value = "b"]')
            .and_return([first_option, second_option])

          expect(first_option).to receive(:click).once
          expect(second_option).to receive(:click).never

          Select.new(multi_select).deselect_by(:value, 'b')
        end

        it 'should fall back to slow lookups when "get by visible text fails" and there is a space' do
          first_option = double(Element, selected?: false, text: 'foo bar')
          first_option.stub(to_a: [first_option])

          xpath1 = './/option[normalize-space(.) = "foo bar"]'
          xpath2 = './/option[contains(., "foo")]'

          expect(select).to receive(:attribute).with(:multiple).and_return 'false'
          expect(select).to receive(:find_elements).with(xpath: xpath1).once.and_return([])
          expect(select).to receive(:find_elements).with(xpath: xpath2).once.and_return([first_option])

          expect(first_option).to receive(:click).once

          Select.new(select).select_by(:text, 'foo bar')
        end

        it 'should raise NoSuchElementError if there are no selects to select' do
          expect(select).to receive(:attribute).with(:multiple).and_return('false')
          expect(select).to receive(:find_elements).at_least(3).times.and_return []

          s = Select.new select

          expect do
            s.select_by :index, 12
          end.to raise_error(Error::NoSuchElementError)

          expect do
            s.select_by :value, 'not there'
          end.to raise_error(Error::NoSuchElementError)

          expect do
            s.select_by :text, 'also not there'
          end.to raise_error(Error::NoSuchElementError)
        end

        it 'should raise NoSuchElementError if there are no selects to deselect' do
          expect(multi_select).to receive(:attribute).with(:multiple).and_return('true')
          expect(multi_select).to receive(:find_elements).at_least(3).times.and_return []

          s = Select.new multi_select

          expect do
            s.deselect_by :index, 12
          end.to raise_error(Error::NoSuchElementError)

          expect do
            s.deselect_by :value, 'not there'
          end.to raise_error(Error::NoSuchElementError)

          expect do
            s.deselect_by :text, 'also not there'
          end.to raise_error(Error::NoSuchElementError)
        end

        it 'should raise UnsupportedOperationError if trying to deselect options in non-multiselect' do
          expect(select).to receive(:attribute).with(:multiple).and_return('false')

          s = Select.new select

          expect do
            s.deselect_by :index, 0
          end.to raise_error(Error::UnsupportedOperationError)

          expect do
            s.deselect_by :value, 'not there'
          end.to raise_error(Error::UnsupportedOperationError)

          expect do
            s.deselect_by :text, 'also not there'
          end.to raise_error(Error::UnsupportedOperationError)
        end
      end # Select

      describe Escaper do
        it 'converts an unquoted string into one with quotes' do
          expect(Escaper.escape('abc')).to eq('"abc"')
          expect(Escaper.escape('abc  aqewqqw')).to eq('"abc  aqewqqw"')
          expect(Escaper.escape('')).to eq('""')
          expect(Escaper.escape('  ')).to eq('"  "')
          expect(Escaper.escape('  abc  ')).to eq('"  abc  "')
        end

        it 'double quotes a string that contains a single quote' do
          expect(Escaper.escape("f'oo")).to eq(%("f'oo"))
        end

        it 'single quotes a string that contains a double quote' do
          expect(Escaper.escape('f"oo')).to eq(%('f"oo'))
        end

        it 'provides concatenated strings when string to escape contains both single and double quotes' do
          expect(Escaper.escape(%(f"o'o))).to eq(%{concat("f", '"', "o'o")})
        end

        it 'provides concatenated strings when string ends with quote' do
          expect(Escaper.escape(%('"))).to eq(%{concat("'", '"')})
        end
      end
    end # Support
  end # WebDriver
end # Selenium
