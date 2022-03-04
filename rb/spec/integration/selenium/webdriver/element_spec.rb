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
    describe Element do
      it 'should click' do
        driver.navigate.to url_for('formPage.html')
        expect { driver.find_element(id: 'imageButton').click }.not_to raise_error
        reset_driver!(1) if %i[safari safari_preview].include? GlobalTestEnv.browser
      end

      # Safari returns "click intercepted" error instead of "element click intercepted"
      it 'should raise if different element receives click', except: {browser: %i[safari safari_preview]} do
        driver.navigate.to url_for('click_tests/overlapping_elements.html')
        expect { driver.find_element(id: 'contents').click }.to raise_error(Error::ElementClickInterceptedError)
      end

      # Safari returns "click intercepted" error instead of "element click intercepted"
      it 'should raise if element is partially covered', except: {browser: %i[safari safari_preview]} do
        driver.navigate.to url_for('click_tests/overlapping_elements.html')
        expect { driver.find_element(id: 'other_contents').click }.to raise_error(Error::ElementClickInterceptedError)
      end

      it 'should submit' do
        driver.navigate.to url_for('formPage.html')
        wait_for_element(id: 'submitButton')
        expect { driver.find_element(id: 'submitButton').submit }.not_to raise_error
        reset_driver!
      end

      it 'should send string keys' do
        driver.navigate.to url_for('formPage.html')
        wait_for_element(id: 'working')
        expect { driver.find_element(id: 'working').send_keys('foo', 'bar') }.not_to raise_error
      end

      it 'should send key presses' do
        driver.navigate.to url_for('javascriptPage.html')
        key_reporter = driver.find_element(id: 'keyReporter')

        key_reporter.send_keys('Tet', :arrow_left, 's')
        expect(key_reporter.attribute('value')).to eq('Test')
      end

      # https://github.com/mozilla/geckodriver/issues/245
      it 'should send key presses chords', except: {browser: %i[firefox firefox_nightly safari safari_preview]} do
        driver.navigate.to url_for('javascriptPage.html')
        key_reporter = driver.find_element(id: 'keyReporter')

        key_reporter.send_keys([:shift, 'h'], 'ello')
        expect(key_reporter.attribute('value')).to eq('Hello')
      end

      it 'should handle file uploads' do
        driver.navigate.to url_for('formPage.html')

        element = driver.find_element(id: 'upload')
        expect(element.attribute('value')).to be_empty

        path = WebDriver::Platform.windows? ? WebDriver::Platform.windows_path(__FILE__) : __FILE__

        element.send_keys path

        expect(element.attribute('value')).to include(File.basename(path))
      end

      describe 'properties and attributes' do
        before { driver.navigate.to url_for('formPage.html') }

        context 'string type' do
          let(:element) { driver.find_element(id: 'checky') }
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

        context 'numeric type' do
          let(:element) { driver.find_element(id: 'withText') }
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

        context 'boolean type of true' do
          let(:element) { driver.find_element(id: 'checkedchecky') }
          let(:prop_or_attr) { 'checked' }

          it '#dom_attribute returns String', except: {browser: :safari} do
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property returns true' do
            expect(element.property(prop_or_attr)).to eq true
          end

          it '#attribute returns String' do
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end

          it '#dom_attribute does not update after click', except: {browser: :safari} do
            element.click
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property updates to false after click' do
            element.click
            expect(element.property(prop_or_attr)).to eq false
          end

          it '#attribute updates to nil after click' do
            element.click
            expect(element.attribute(prop_or_attr)).to eq nil
          end
        end

        context 'boolean type of false' do
          let(:element) { driver.find_element(id: 'checky') }
          let(:prop_or_attr) { 'checked' }

          it '#dom_attribute returns nil' do
            expect(element.dom_attribute(prop_or_attr)).to be_nil
          end

          it '#property returns false' do
            expect(element.property(prop_or_attr)).to eq false
          end

          it '#attribute returns nil' do
            expect(element.attribute(prop_or_attr)).to be_nil
          end

          it '#dom_attribute does not update after click' do
            element.click
            expect(element.dom_attribute(prop_or_attr)).to eq nil
          end

          it '#property updates to true after click' do
            element.click
            expect(element.property(prop_or_attr)).to eq true
          end

          it '#attribute updates to String after click' do
            element.click
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end
        end

        context 'property exists but attribute does not' do
          let(:element) { driver.find_element(id: 'withText') }
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

        context 'attribute exists but property does not' do
          let(:element) { driver.find_element(id: 'vsearchGadget') }
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

        context 'neither attribute nor property exists' do
          let(:element) { driver.find_element(id: 'checky') }
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

        context 'style' do
          before { driver.navigate.to url_for('clickEventPage.html') }

          let(:element) { driver.find_element(id: 'result') }
          let(:prop_or_attr) { 'style' }

          it '#dom_attribute attribute with no formatting' do
            expect(element.dom_attribute(prop_or_attr)).to eq 'width:300;height:60'
          end

          # TODO: This might not be correct behavior
          it '#property returns object',
             except: [{browser: :firefox,
                       reason: 'https://github.com/mozilla/geckodriver/issues/1846'},
                      {browser: :safari}] do
            expect(element.property(prop_or_attr)).to eq %w[width height]
          end

          it '#attribute returns attribute with formatting' do
            expect(element.attribute(prop_or_attr)).to eq 'width: 300px; height: 60px;'
          end
        end

        context 'incorrect casing' do
          let(:element) { driver.find_element(id: 'checky') }
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

        context 'property attribute case difference with attribute casing' do
          let(:element) { driver.find_element(name: 'readonly') }
          let(:prop_or_attr) { 'readonly' }

          it '#dom_attribute returns a String', except: {browser: :safari} do
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property returns nil' do
            expect(element.property(prop_or_attr)).to be_nil
          end

          it '#attribute returns a String' do
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end
        end

        context 'property attribute case difference with property casing' do
          let(:element) { driver.find_element(name: 'readonly') }
          let(:prop_or_attr) { 'readOnly' }

          it '#dom_attribute returns a String',
             except: [{browser: :firefox,
                       reason: 'https://github.com/mozilla/geckodriver/issues/1850'},
                      {browser: :safari}] do
            expect(element.dom_attribute(prop_or_attr)).to eq 'true'
          end

          it '#property returns property as true' do
            expect(element.property(prop_or_attr)).to eq true
          end

          it '#attribute returns property as String' do
            expect(element.attribute(prop_or_attr)).to eq 'true'
          end
        end

        context 'property attribute name difference with attribute naming' do
          let(:element) { driver.find_element(id: 'wallace') }
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

        context 'property attribute name difference with property naming' do
          let(:element) { driver.find_element(id: 'wallace') }
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

        context 'property attribute value difference' do
          let(:element) { driver.find_element(tag_name: 'form') }
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

      it 'returns ARIA role', only: {browser: %i[chrome edge]} do
        driver.navigate.to "data:text/html," \
                           "<div role='heading' aria-level='1'>Level 1 Header</div>" \
                           "<h1>Level 1 Header</h1>" \
                           "<h2 role='alert'>Level 2 Header</h2>"
        expect(driver.find_element(tag_name: 'div').aria_role).to eq('heading')
        expect(driver.find_element(tag_name: 'h1').aria_role).to eq('heading')
        expect(driver.find_element(tag_name: 'h2').aria_role).to eq('alert')
      end

      it 'returns accessible name', only: {browser: %i[chrome edge]} do
        driver.navigate.to "data:text/html,<h1>Level 1 Header</h1>"
        expect(driver.find_element(tag_name: 'h1').accessible_name).to eq('Level 1 Header')
      end

      it 'should clear' do
        driver.navigate.to url_for('formPage.html')
        expect { driver.find_element(id: 'withText').clear }.not_to raise_error
      end

      it 'should get and set selected' do
        driver.navigate.to url_for('formPage.html')

        cheese = driver.find_element(id: 'cheese')
        peas = driver.find_element(id: 'peas')

        cheese.click

        expect(cheese).to be_selected
        expect(peas).not_to be_selected

        peas.click

        expect(peas).to be_selected
        expect(cheese).not_to be_selected
      end

      it 'should get enabled' do
        driver.navigate.to url_for('formPage.html')
        expect(driver.find_element(id: 'notWorking')).not_to be_enabled
      end

      it 'should get text' do
        driver.navigate.to url_for('xhtmlTest.html')
        expect(driver.find_element(class: 'header').text).to eq('XHTML Might Be The Future')
      end

      it 'should get displayed' do
        driver.navigate.to url_for('xhtmlTest.html')
        expect(driver.find_element(class: 'header')).to be_displayed
      end

      context 'size and location' do
        it 'should get current location' do
          driver.navigate.to url_for('xhtmlTest.html')
          loc = driver.find_element(class: 'header').location

          expect(loc.x).to be >= 1
          expect(loc.y).to be >= 1
        end

        it 'should get location once scrolled into view' do
          driver.navigate.to url_for('javascriptPage.html')
          loc = driver.find_element(id: 'keyUp').location_once_scrolled_into_view

          expect(loc.x).to be >= 1
          expect(loc.y).to be >= 0 # can be 0 if scrolled to the top
        end

        it 'should get size' do
          driver.navigate.to url_for('xhtmlTest.html')
          size = driver.find_element(class: 'header').size

          expect(size.width).to be_positive
          expect(size.height).to be_positive
        end

        it 'should get rect' do
          driver.navigate.to url_for('xhtmlTest.html')
          rect = driver.find_element(class: 'header').rect

          expect(rect.x).to be_positive
          expect(rect.y).to be_positive
          expect(rect.width).to be_positive
          expect(rect.height).to be_positive
        end
      end

      # IE - https://github.com/SeleniumHQ/selenium/pull/4043
      it 'should drag and drop', except: {browser: :ie} do
        driver.navigate.to url_for('dragAndDropTest.html')

        img1 = driver.find_element(id: 'test1')
        img2 = driver.find_element(id: 'test2')

        driver.action.drag_and_drop_by(img1, 100, 100)
              .drag_and_drop(img2, img1)
              .perform

        expect(img1.location).to eq(img2.location)
      end

      it 'should get css property' do
        driver.navigate.to url_for('javascriptPage.html')
        element = driver.find_element(id: 'green-parent')

        style1 = element.css_value('background-color')
        style2 = element.style('background-color') # backwards compatibility

        acceptable = ['rgb(0, 128, 0)', '#008000', 'rgba(0,128,0,1)', 'rgba(0, 128, 0, 1)']
        expect(acceptable).to include(style1, style2)
      end

      it 'should know when two elements are equal' do
        driver.navigate.to url_for('simpleTest.html')

        body = driver.find_element(tag_name: 'body')
        xbody = driver.find_element(xpath: '//body')
        jsbody = driver.execute_script('return document.getElementsByTagName("body")[0]')

        expect(body).to eq(xbody)
        expect(body).to eq(jsbody)
        expect(body).to eql(xbody)
        expect(body).to eql(jsbody)
      end

      it 'should know when element arrays are equal' do
        driver.navigate.to url_for('simpleTest.html')

        tags = driver.find_elements(tag_name: 'div')
        jstags = driver.execute_script('return document.getElementsByTagName("div")')

        expect(tags).to eq(jstags)
      end

      it 'should know when two elements are not equal' do
        driver.navigate.to url_for('simpleTest.html')

        elements = driver.find_elements(tag_name: 'p')
        p1 = elements.fetch(0)
        p2 = elements.fetch(1)

        expect(p1).not_to eq(p2)
        expect(p1).not_to eql(p2)
      end

      it 'should return the same #hash for equal elements when found by Driver#find_element' do
        driver.navigate.to url_for('simpleTest.html')

        body = driver.find_element(tag_name: 'body')
        xbody = driver.find_element(xpath: '//body')

        expect(body.hash).to eq(xbody.hash)
      end

      it 'should return the same #hash for equal elements when found by Driver#find_elements' do
        driver.navigate.to url_for('simpleTest.html')

        body = driver.find_elements(tag_name: 'body').fetch(0)
        xbody = driver.find_elements(xpath: '//body').fetch(0)

        expect(body.hash).to eq(xbody.hash)
      end
    end
  end # WebDriver
end # Selenium
