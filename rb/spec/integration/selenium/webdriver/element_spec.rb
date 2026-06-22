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
    describe Element, skip_unless: {bidi: false, reason: 'Not yet implemented with BiDi'} do
      it 'clicks' do
        open_file 'formPage.html'
        element = wait_for_element(id: 'imageButton')
        expect { element.click }.not_to raise_error
      end

      # Safari returns "click intercepted" error instead of "element click intercepted"
      it 'raises if different element receives click', pending_if: {browser: %i[safari safari_preview]} do
        open_file 'click_tests/overlapping_elements.html'
        element = wait_for_element(id: 'contents', timeout: 10)
        expect { element.click }.to raise_error(Error::ElementClickInterceptedError)
      end

      # Safari returns "click intercepted" error instead of "element click intercepted"
      it 'raises if element is partially covered', pending_if: {browser: %i[safari safari_preview]} do
        open_file 'click_tests/overlapping_elements.html'
        element = wait_for_element(id: 'other_contents')
        expect { element.click }.to raise_error(Error::ElementClickInterceptedError)
      end

      it 'raises if element stale' do
        open_file 'formPage.html'
        button = wait_for_element(id: 'imageButton')
        driver.navigate.refresh

        expect { button.click }.to raise_exception(Error::StaleElementReferenceError,
                                                   /errors#staleelementreferenceexception/)
      end

      describe '#submit' do
        it 'valid submit button' do
          open_file 'formPage.html'
          wait_for_element(id: 'submitButton').submit

          wait_for_url('resultPage.html')
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'any input element in form' do
          open_file 'formPage.html'
          wait_for_element(id: 'checky').submit

          wait_for_url('resultPage.html')
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'any element in form' do
          open_file 'formPage.html'
          wait_for_element(css: 'form > p').submit

          wait_for_url('resultPage.html')
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'button with id submit' do
          open_file 'formPage.html'
          wait_for_element(id: 'submit').submit

          wait_for_url('resultPage.html')
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'button with name submit' do
          open_file 'formPage.html'
          wait_for_element(name: 'submit').submit

          wait_for_url('resultPage.html')
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'errors with button outside form' do
          open_file 'formPage.html'
          element = wait_for_element(name: 'SearchableText')
          expect { element.submit }.to raise_error(Error::UnsupportedOperationError)
        end
      end

      it 'sends empty keys' do
        open_file 'formPage.html'
        element = wait_for_element(id: 'working')
        element.send_keys
        expect(element.text).to be_empty
      end

      it 'sends string keys' do
        open_file 'formPage.html'
        wait_for_element(id: 'working')
        expect { driver.find_element(id: 'working').send_keys('foo', 'bar') }.not_to raise_error
      end

      it 'sends key presses' do
        open_file 'javascriptPage.html'
        key_reporter = wait_for_element(id: 'keyReporter')

        key_reporter.send_keys('Tet', :arrow_left, 's')
        expect(key_reporter.attribute('value')).to eq('Test')
      end

      # https://github.com/mozilla/geckodriver/issues/245
      it 'sends key presses chords', pending_if: {browser: %i[firefox safari safari_preview]} do
        open_file 'javascriptPage.html'
        key_reporter = wait_for_element(id: 'keyReporter')

        key_reporter.send_keys([:shift, 'h'], 'ello')
        expect(key_reporter.attribute('value')).to eq('Hello')
      end

      it 'handles file uploads' do
        open_file 'formPage.html'

        element = wait_for_element(id: 'upload')
        expect(element.attribute('value')).to be_empty

        path = WebDriver::Platform.windows? ? WebDriver::Platform.windows_path(__FILE__) : __FILE__

        element.send_keys path

        expect(element.attribute('value')).to include(File.basename(path))
      end

      describe 'properties and attributes' do
        before { open_file 'formPage.html' }

        context 'when string type' do
          let(:element) { wait_for_element(id: 'checky') }
          let(:prop_or_attr) { 'type' }

          it '#dom_attribute returns attribute value' do
            expect(element.dom_attribute(prop_or_attr)).to eq 'checkbox'
          end

          it '#property returns property value' do
            expect(element.property(prop_or_attr)).to eq 'checkbox'
          end

          it '#attribute returns value' do
            expect(element.attribute(prop_or_attr)).to eq 'checkbox'
          end
        end

        context 'when numeric type' do
          let(:element) { wait_for_element(id: 'withText') }
          let(:prop_or_attr) { 'rows' }

          it '#dom_attribute String' do
            expect(element.dom_attribute(prop_or_attr)).to eq '5'
          end

          it '#property returns Number' do
            expect(element.property(prop_or_attr)).to eq 5
          end

          it '#attribute returns String' do
            expect(element.attribute(prop_or_attr)).to eq '5'
          end
        end

        context 'with boolean type of true' do
          let(:element) { wait_for_element(id: 'checkedchecky') }
          let(:prop_or_attr) { 'checked' }

          it '#dom_attribute returns String', pending_if: {browser: :safari} do
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property returns true' do
            expect(element.property(prop_or_attr)).to be true
          end

          it '#attribute returns String' do
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end

          it '#dom_attribute does not update after click', pending_if: {browser: :safari} do
            element.click
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property updates to false after click' do
            element.click
            expect(element.property(prop_or_attr)).to be false
          end

          it '#attribute updates to nil after click' do
            element.click
            expect(element.attribute(prop_or_attr)).to be_nil
          end
        end

        context 'with boolean type of false' do
          let(:element) { wait_for_element(id: 'checky') }
          let(:prop_or_attr) { 'checked' }

          it '#dom_attribute returns nil' do
            expect(element.dom_attribute(prop_or_attr)).to be_nil
          end

          it '#property returns false' do
            expect(element.property(prop_or_attr)).to be false
          end

          it '#attribute returns nil' do
            expect(element.attribute(prop_or_attr)).to be_nil
          end

          it '#dom_attribute does not update after click' do
            element.click
            expect(element.dom_attribute(prop_or_attr)).to be_nil
          end

          it '#property updates to true after click' do
            element.click
            expect(element.property(prop_or_attr)).to be true
          end

          it '#attribute updates to String after click' do
            element.click
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end
        end

        context 'when property exists but attribute does not' do
          let(:element) { wait_for_element(id: 'withText') }
          let(:prop_or_attr) { 'value' }

          it '#dom_attribute returns nil' do
            expect(element.dom_attribute(prop_or_attr)).to be_nil
          end

          it '#property returns default property' do
            expect(element.property(prop_or_attr)).to eq 'Example text'
          end

          it '#attribute returns default property' do
            expect(element.attribute(prop_or_attr)).to eq 'Example text'
          end

          it '#property returns updated property' do
            element.clear
            expect(element.property(prop_or_attr)).to be_empty
          end

          it '#attribute returns updated property' do
            element.clear
            expect(element.attribute(prop_or_attr)).to be_empty
          end
        end

        context 'when attribute exists but property does not' do
          let(:element) { wait_for_element(id: 'vsearchGadget') }
          let(:prop_or_attr) { 'accesskey' }

          it '#dom_attribute returns attribute' do
            expect(element.dom_attribute(prop_or_attr)).to eq '4'
          end

          it '#property returns nil' do
            expect(element.property(prop_or_attr)).to be_nil
          end

          it '#attribute returns attribute' do
            expect(element.attribute(prop_or_attr)).to eq '4'
          end
        end

        context 'when neither attribute nor property exists' do
          let(:element) { wait_for_element(id: 'checky') }
          let(:prop_or_attr) { 'nonexistent' }

          it '#dom_attribute returns nil' do
            expect(element.dom_attribute(prop_or_attr)).to be_nil
          end

          it '#property returns nil' do
            expect(element.property(prop_or_attr)).to be_nil
          end

          it '#attribute returns nil' do
            expect(element.attribute(prop_or_attr)).to be_nil
          end
        end

        describe 'style' do
          before { open_file 'clickEventPage.html' }

          let(:element) { wait_for_element(id: 'result') }
          let(:prop_or_attr) { 'style' }

          it '#dom_attribute attribute with no formatting' do
            expect(element.dom_attribute(prop_or_attr)).to eq 'width:300;height:60'
          end

          # TODO: This might not be correct behavior
          it '#property returns object',
             pending_if: [{browser: :firefox,
                           reason: 'https://github.com/mozilla/geckodriver/issues/1846'},
                          {browser: :safari}] do
            expect(element.property(prop_or_attr)).to eq %w[width height]
          end

          it '#attribute returns attribute with formatting' do
            expect(element.attribute(prop_or_attr)).to eq 'width: 300px; height: 60px;'
          end
        end

        describe 'incorrect casing' do
          let(:element) { wait_for_element(id: 'checky') }
          let(:prop_or_attr) { 'nAme' }

          it '#dom_attribute returns correctly cased attribute' do
            expect(element.dom_attribute(prop_or_attr)).to eq 'checky'
          end

          it '#property returns nil' do
            expect(element.property(prop_or_attr)).to be_nil
          end

          it '#attribute returns correctly cased attribute' do
            expect(element.attribute(prop_or_attr)).to eq 'checky'
          end
        end

        describe 'property attribute case difference with attribute casing' do
          let(:element) { wait_for_element(name: 'readonly') }
          let(:prop_or_attr) { 'readonly' }

          it '#dom_attribute returns a String', pending_if: {browser: :safari} do
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property returns nil' do
            expect(element.property(prop_or_attr)).to be_nil
          end

          it '#attribute returns a String' do
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end
        end

        describe 'property attribute case difference with property casing' do
          let(:element) { wait_for_element(name: 'readonly') }
          let(:prop_or_attr) { 'readOnly' }

          it '#dom_attribute returns a String',
             pending_if: [{browser: :firefox,
                           reason: 'https://github.com/mozilla/geckodriver/issues/1850'},
                          {browser: :safari}] do
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property returns property as true' do
            expect(element.property(prop_or_attr)).to be true
          end

          it '#attribute returns property as String' do
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end
        end

        describe 'property attribute name difference with attribute naming' do
          let(:element) { wait_for_element(id: 'wallace') }
          let(:prop_or_attr) { 'class' }

          it '#dom_attribute returns attribute value' do
            expect(element.dom_attribute(prop_or_attr)).to eq 'gromit'
          end

          it '#property returns nil' do
            expect(element.property(prop_or_attr)).to be_nil
          end

          it '#attribute returns attribute value' do
            expect(element.attribute(prop_or_attr)).to eq 'gromit'
          end
        end

        describe 'property attribute name difference with property naming' do
          let(:element) { wait_for_element(id: 'wallace') }
          let(:prop_or_attr) { 'className' }

          it '#dom_attribute returns nil' do
            expect(element.dom_attribute(prop_or_attr)).to be_nil
          end

          it '#property returns property value' do
            expect(element.property(prop_or_attr)).to eq 'gromit'
          end

          it '#attribute returns property value' do
            expect(element.attribute(prop_or_attr)).to eq 'gromit'
          end
        end

        describe 'property attribute value difference' do
          let(:element) { wait_for_element(tag_name: 'form') }
          let(:prop_or_attr) { 'action' }

          it '#dom_attribute returns attribute value' do
            expect(element.dom_attribute(prop_or_attr)).to eq 'resultPage.html'
          end

          it '#property returns property value' do
            expect(element.property(prop_or_attr)).to match(%r{http://(.+)/resultPage\.html})
          end

          it '#attribute returns property value' do
            expect(element.attribute(prop_or_attr)).to match(%r{http://(.+)/resultPage\.html})
          end
        end
      end

      it 'returns ARIA role' do
        driver.navigate.to 'data:text/html,' \
                           "<div role='heading' aria-level='1'>Level 1 Header</div>" \
                           '<h1>Level 1 Header</h1>' \
                           "<h2 role='alert'>Level 2 Header</h2>"
        expect(driver.find_element(tag_name: 'div').aria_role).to eq('heading')
        expect(driver.find_element(tag_name: 'h1').aria_role).to eq('heading')
        expect(driver.find_element(tag_name: 'h2').aria_role).to eq('alert')
      end

      it 'returns accessible name' do
        driver.navigate.to 'data:text/html,<h1>Level 1 Header</h1>'
        expect(driver.find_element(tag_name: 'h1').accessible_name).to eq('Level 1 Header')
      end

      it 'clears' do
        open_file 'formPage.html'
        element = wait_for_element(id: 'withText')
        expect { element.clear }.not_to raise_error
      end

      it 'gets and set selected' do
        open_file 'formPage.html'

        cheese = wait_for_element(id: 'cheese')
        peas = wait_for_element(id: 'peas')

        cheese.click

        expect(cheese).to be_selected
        expect(peas).not_to be_selected

        peas.click

        expect(peas).to be_selected
        expect(cheese).not_to be_selected
      end

      it 'gets enabled' do
        open_file 'formPage.html'
        element = wait_for_element(id: 'notWorking')
        expect(element).not_to be_enabled
      end

      it 'gets text' do
        open_file 'xhtmlTest.html'
        element = wait_for_element(class: 'header')
        expect(element.text).to eq('XHTML Might Be The Future')
      end

      it 'gets displayed' do
        open_file 'xhtmlTest.html'
        element = wait_for_element(class: 'header')
        expect(element).to be_displayed
      end

      describe 'size and location' do
        it 'gets current location' do
          open_file 'xhtmlTest.html'
          loc = wait_for_element(class: 'header').location

          expect(loc.x).to be >= 1
          expect(loc.y).to be >= 1
        end

        it 'gets location once scrolled into view' do
          open_file 'javascriptPage.html'
          loc = wait_for_element(id: 'keyUp').location_once_scrolled_into_view

          expect(loc.x).to be >= 1
          expect(loc.y).to be >= 0 # can be 0 if scrolled to the top
        end

        it 'gets size' do
          open_file 'xhtmlTest.html'
          size = wait_for_element(class: 'header').size

          expect(size.width).to be_positive
          expect(size.height).to be_positive
        end

        it 'gets rect' do
          open_file 'xhtmlTest.html'
          rect = wait_for_element(class: 'header').rect

          expect(rect.x).to be_positive
          expect(rect.y).to be_positive
          expect(rect.width).to be_positive
          expect(rect.height).to be_positive
        end
      end

      # IE - https://github.com/SeleniumHQ/selenium/pull/4043
      it 'drags and drop', pending_if: {browser: :ie} do
        open_file 'dragAndDropTest.html'

        img1 = wait_for_element(id: 'test1')
        img2 = wait_for_element(id: 'test2')

        driver.action.drag_and_drop_by(img1, 100, 100)
              .drag_and_drop(img2, img1)
              .perform

        expect(img1.location).to eq(img2.location)
      end

      it 'gets css property' do
        open_file 'javascriptPage.html'
        element = wait_for_element(id: 'green-parent')

        style1 = element.css_value('background-color')
        style2 = element.style('background-color') # backwards compatibility

        acceptable = ['rgb(0, 128, 0)', '#008000', 'rgba(0,128,0,1)', 'rgba(0, 128, 0, 1)']
        expect(acceptable).to include(style1, style2)
      end

      it 'knows when two elements are equal' do
        open_file 'simpleTest.html'

        body = wait_for_element(tag_name: 'body')
        xbody = wait_for_element(xpath: '//body')
        jsbody = driver.execute_script('return document.getElementsByTagName("body")[0]')

        expect(body).to eq(xbody)
        expect(body).to eq(jsbody)
        expect(body).to eql(xbody)
        expect(body).to eql(jsbody)
      end

      it 'knows when element arrays are equal' do
        open_file 'simpleTest.html'

        tags = driver.find_elements(tag_name: 'div')
        jstags = driver.execute_script('return document.getElementsByTagName("div")')

        expect(tags).to eq(jstags)
      end

      it 'knows when two elements are not equal' do
        open_file 'simpleTest.html'

        elements = driver.find_elements(tag_name: 'p')
        p1 = elements.fetch(0)
        p2 = elements.fetch(1)

        expect(p1).not_to eq(p2)
        expect(p1).not_to eql(p2)
      end

      it 'returns the same #hash for equal elements when found by Driver#find_element' do
        open_file 'simpleTest.html'

        body = driver.find_element(tag_name: 'body')
        xbody = driver.find_element(xpath: '//body')

        expect(body.hash).to eq(xbody.hash)
      end

      it 'returns the same #hash for equal elements when found by Driver#find_elements' do
        open_file 'simpleTest.html'

        body = driver.find_elements(tag_name: 'body').fetch(0)
        xbody = driver.find_elements(xpath: '//body').fetch(0)

        expect(body.hash).to eq(xbody.hash)
      end
    end
  end # WebDriver
end # Selenium
