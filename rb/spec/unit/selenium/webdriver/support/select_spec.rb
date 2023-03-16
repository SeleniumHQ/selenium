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
      describe Select do
        let(:select) do
          select_element = instance_double(Element, tag_name: 'select')
          allow(select_element).to receive(:dom_attribute).with(:multiple)
          select_element
        end

        let(:multi_select) do
          select_element = instance_double(Element, tag_name: 'select')
          allow(select_element).to receive(:dom_attribute).with(:multiple).and_return 'multiple'
          select_element
        end

        it 'raises ArgumentError if passed a non-select Element' do
          link = instance_double(Element, tag_name: 'a')

          expect { described_class.new link }.to raise_error(ArgumentError)
        end

        it 'indicates whether a select is multiple correctly' do
          selects = Array.new(4) { instance_double(Element, tag_name: 'select') }

          allow(selects[0]).to receive(:dom_attribute).with(:multiple).and_return('false')
          allow(selects[1]).to receive(:dom_attribute).with(:multiple).and_return(nil)
          allow(selects[2]).to receive(:dom_attribute).with(:multiple).and_return('true')
          allow(selects[3]).to receive(:dom_attribute).with(:multiple).and_return('multiple')

          expect(described_class.new(selects[0])).not_to be_multiple
          expect(described_class.new(selects[1])).not_to be_multiple
          expect(described_class.new(selects[2])).to be_multiple
          expect(described_class.new(selects[3])).to be_multiple
        end

        it 'returns all options' do
          options = []
          allow(multi_select).to receive(:find_elements).and_return(options)

          expect(described_class.new(multi_select).options).to eql(options)
          expect(multi_select).to have_received(:find_elements).with(tag_name: 'option')
        end

        it 'returns all selected options' do
          bad_option  = instance_double(Element, selected?: false)
          good_option = instance_double(Element, selected?: true)
          allow(multi_select).to receive(:find_elements).and_return([bad_option, good_option])

          opts = described_class.new(multi_select).selected_options

          expect(opts.size).to eq(1)
          expect(opts.first).to eq(good_option)
          expect(multi_select).to have_received(:find_elements).with(tag_name: 'option')
        end

        it 'returns the first selected option' do
          first_option  = instance_double(Element, selected?: true)
          second_option = instance_double(Element, selected?: true)
          allow(multi_select).to receive(:find_elements).and_return([first_option, second_option])

          option = described_class.new(multi_select).first_selected_option
          expect(option).to eq(first_option)
          expect(multi_select).to have_received(:find_elements).with(tag_name: 'option')
        end

        it 'raises a NoSuchElementError if nothing is selected' do
          option = instance_double(Element, selected?: false)
          allow(multi_select).to receive(:find_elements).and_return([option])

          expect { described_class.new(multi_select).first_selected_option }.to raise_error(Error::NoSuchElementError)
        end

        it 'allows options to be selected by visible text' do
          option = instance_double(Element, selected?: false, enabled?: true, click: nil)
          allow(multi_select).to receive(:find_elements).and_return([option])

          described_class.new(multi_select).select_by(:text, 'fish')
          expect(option).to have_received(:click)
          expect(multi_select).to have_received(:find_elements).with(xpath: './/option[normalize-space(.) = "fish"]')
        end

        it 'allows options to be selected by index' do
          first_option = instance_double(Element, selected?: true, enabled?: true, click: nil)
          second_option = instance_double(Element, selected?: false, enabled?: true, click: nil)

          allow(first_option).to receive(:property).with(:index).and_return 0
          allow(second_option).to receive(:property).with(:index).and_return 1
          allow(multi_select).to receive(:find_elements).and_return([first_option, second_option])

          described_class.new(multi_select).select_by(:index, 1)
          expect(first_option).to have_received(:property).with(:index)
          expect(second_option).to have_received(:property).with(:index)
          expect(multi_select).to have_received(:find_elements).with(tag_name: 'option')
          expect(first_option).not_to have_received(:click)
          expect(second_option).to have_received(:click).once
        end

        it 'allows options to be selected by returned value' do
          first_option = instance_double(Element, selected?: false, enabled?: true, click: nil)
          allow(multi_select).to receive(:find_elements).and_return([first_option])

          described_class.new(multi_select).select_by(:value, 'b')

          expect(multi_select).to have_received(:find_elements).with(xpath: './/option[@value = "b"]')
          expect(first_option).to have_received(:click).once
          expect(multi_select).to have_received(:find_elements).with(xpath: './/option[@value = "b"]')
        end

        it 'can deselect all when select supports multiple selections' do
          first_option = instance_double(Element, selected?: true, click: nil)
          second_option = instance_double(Element, selected?: false, click: nil)
          allow(multi_select).to receive(:find_elements).and_return([first_option, second_option])

          described_class.new(multi_select).deselect_all

          expect(multi_select).to have_received(:find_elements).with(tag_name: 'option')
          expect(first_option).to have_received(:click).once
          expect(second_option).not_to have_received(:click)
        end

        it 'can not deselect all when select does not support multiple selections' do
          expect { described_class.new(select).deselect_all }.to raise_error(Error::UnsupportedOperationError)
        end

        it 'can deselect options by visible text' do
          first_option  = instance_double(Element, selected?: true, click: nil)
          second_option = instance_double(Element, selected?: false, click: nil)
          allow(multi_select).to receive(:find_elements).and_return([first_option, second_option])

          described_class.new(multi_select).deselect_by(:text, 'b')

          expect(multi_select).to have_received(:find_elements).with(xpath: './/option[normalize-space(.) = "b"]')
          expect(first_option).to have_received(:click).once
          expect(second_option).not_to have_received(:click)
        end

        it 'can deselect options by index' do
          first_option  = instance_double(Element, selected?: true, click: nil)
          second_option = instance_double(Element, click: nil)

          allow(multi_select).to receive(:find_elements).and_return([first_option, second_option])
          allow(first_option).to receive(:property).with(:index).and_return(2)
          allow(second_option).to receive(:property).with(:index).and_return(1)

          described_class.new(multi_select).deselect_by(:index, 2)

          expect(first_option).to have_received(:click).once
          expect(second_option).not_to have_received(:click)
          expect(multi_select).to have_received(:find_elements).with(tag_name: 'option')
        end

        it 'can deselect options by returned value' do
          first_option = instance_double(Element, selected?: true, click: nil)
          second_option = instance_double(Element, selected?: false, click: nil)
          allow(multi_select).to receive(:find_elements).and_return([first_option, second_option])

          described_class.new(multi_select).deselect_by(:value, 'b')

          expect(first_option).to have_received(:click).once
          expect(second_option).not_to have_received(:click)
          expect(multi_select).to have_received(:find_elements).with(xpath: './/option[@value = "b"]')
        end

        it 'falls back to slow lookups when "get by visible text fails" and there is a space' do
          first_option = instance_double(Element, selected?: false, enabled?: true, text: 'foo bar', click: nil)
          allow(select).to receive(:find_elements).and_return([], [first_option])

          described_class.new(select).select_by(:text, 'foo bar')

          expect(first_option).to have_received(:click).once
          expect(select).to have_received(:find_elements).with(xpath: './/option[normalize-space(.) = "foo bar"]').once
          expect(select).to have_received(:find_elements).with(xpath: './/option[contains(., "foo")]').once
        end

        it 'raises NoSuchElementError if there are no selects to select' do
          allow(select).to receive(:find_elements).and_return []

          select_element = described_class.new select

          expect { select_element.select_by :index, 12 }.to raise_error(Error::NoSuchElementError)
          expect { select_element.select_by :value, 'not there' }.to raise_error(Error::NoSuchElementError)
          expect { select_element.select_by :text, 'also not there' }.to raise_error(Error::NoSuchElementError)
        end

        it 'raises NoSuchElementError if there are no selects to deselect' do
          allow(multi_select).to receive(:find_elements).and_return []

          select_element = described_class.new multi_select

          expect { select_element.deselect_by :index, 12 }.to raise_error(Error::NoSuchElementError)
          expect { select_element.deselect_by :value, 'not there' }.to raise_error(Error::NoSuchElementError)
          expect { select_element.deselect_by :text, 'also not there' }.to raise_error(Error::NoSuchElementError)
        end

        it 'raises UnsupportedOperationError if trying to deselect options in non-multiselect' do
          select_element = described_class.new select

          expect { select_element.deselect_by :index, 0 }.to raise_error(Error::UnsupportedOperationError)
          expect { select_element.deselect_by :value, 'not there' }.to raise_error(Error::UnsupportedOperationError)
          expect { select_element.deselect_by :text, 'also not there' }.to raise_error(Error::UnsupportedOperationError)
        end
      end # Select

      describe Escaper do
        it 'converts an unquoted string into one with quotes' do
          expect(described_class.escape('abc')).to eq('"abc"')
          expect(described_class.escape('abc  aqewqqw')).to eq('"abc  aqewqqw"')
          expect(described_class.escape('')).to eq('""')
          expect(described_class.escape('  ')).to eq('"  "')
          expect(described_class.escape('  abc  ')).to eq('"  abc  "')
        end

        it 'double quotes a string that contains a single quote' do
          expect(described_class.escape("f'oo")).to eq(%("f'oo"))
        end

        it 'single quotes a string that contains a double quote' do
          expect(described_class.escape('f"oo')).to eq(%('f"oo'))
        end

        it 'provides concatenated strings when string to escape contains both single and double quotes' do
          expect(described_class.escape(%(f"o'o))).to eq(%{concat("f", '"', "o'o")})
        end

        it 'provides concatenated strings when string ends with quote' do
          expect(described_class.escape(%('"))).to eq(%{concat("'", '"')})
        end
      end
    end # Support
  end # WebDriver
end # Selenium
