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
    describe ShadowRoot, only: {browser: %i[chrome firefox edge]} do
      before { driver.navigate.to url_for('webComponents.html') }

      let(:custom_element) { driver.find_element(css: 'custom-checkbox-element') }

      it 'gets shadow root from driver' do
        shadow_root = custom_element.shadow_root
        expect(shadow_root).to be_a described_class
      end

      it 'raises error if no shadow root' do
        driver.navigate.to url_for('simpleTest.html')
        div = driver.find_element(css: 'div')
        expect { div.shadow_root }.to raise_error(Error::NoSuchShadowRootError)
      end

      it 'gets shadow root from script' do
        shadow_root = custom_element.shadow_root
        execute_shadow_root = driver.execute_script('return arguments[0].shadowRoot;', custom_element)
        expect(execute_shadow_root).to eq shadow_root
      end

      describe '#find_element' do
        it 'by css' do
          shadow_root = custom_element.shadow_root
          element = shadow_root.find_element(css: 'input')

          expect(element).to be_a Element
        end

        it 'by xpath', except: {browser: %i[chrome edge firefox],
                                reason: 'https://bugs.chromium.org/p/chromedriver/issues/detail?id=4097'} do
          shadow_root = custom_element.shadow_root
          element = shadow_root.find_element(xpath: "//input[type='checkbox']")

          expect(element).to be_a Element
        end

        it 'by link text' do
          shadow_root = custom_element.shadow_root
          element = shadow_root.find_element(link_text: 'Example Link')

          expect(element).to be_a Element
        end

        it 'by partial link text' do
          shadow_root = custom_element.shadow_root
          element = shadow_root.find_element(partial_link_text: 'Link')

          expect(element).to be_a Element
        end

        it 'by tag name', except: {browser: %i[chrome edge firefox],
                                   reason: 'https://bugs.chromium.org/p/chromedriver/issues/detail?id=4097'} do
          shadow_root = custom_element.shadow_root
          element = shadow_root.find_element(tag_name: 'input')

          expect(element).to be_a Element
        end

        it 'raises error if not found' do
          shadow_root = custom_element.shadow_root

          expect { shadow_root.find_element(css: 'no') }.to raise_error(Error::NoSuchElementError)
        end
      end

      describe '#find_elements' do
        it 'by css' do
          shadow_root = custom_element.shadow_root
          elements = shadow_root.find_elements(css: 'input')

          expect(elements.size).to eq 1
          expect(elements.first).to be_a Element
        end

        it 'by xpath', except: {browser: %i[chrome edge firefox],
                                reason: 'https://bugs.chromium.org/p/chromedriver/issues/detail?id=4097'} do
          shadow_root = custom_element.shadow_root
          elements = shadow_root.find_elements(xpath: "//input[type='checkbox']")

          expect(elements.size).to eq 1
          expect(elements.first).to be_a Element
        end

        it 'by link text' do
          shadow_root = custom_element.shadow_root
          elements = shadow_root.find_elements(link_text: 'Example Link')

          expect(elements.size).to eq 1
          expect(elements.first).to be_a Element
        end

        it 'by partial link text' do
          shadow_root = custom_element.shadow_root
          elements = shadow_root.find_elements(partial_link_text: 'Link')

          expect(elements.size).to eq 1
          expect(elements.first).to be_a Element
        end

        it 'by tag name', except: {browser: %i[chrome edge firefox],
                                   reason: 'https://bugs.chromium.org/p/chromedriver/issues/detail?id=4097'} do
          shadow_root = custom_element.shadow_root
          elements = shadow_root.find_elements(tag_name: 'input')

          expect(elements.size).to eq 1
          expect(elements.first).to be_a Element
        end

        it 'is empty when not found' do
          shadow_root = custom_element.shadow_root

          elements = shadow_root.find_elements(css: 'no')
          expect(elements.size).to eq 0
        end
      end
    end
  end # WebDriver
end # Selenium
