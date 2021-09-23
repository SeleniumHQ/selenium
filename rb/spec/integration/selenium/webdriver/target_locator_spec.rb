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
    describe TargetLocator do
      after do
        ensure_single_window
      end

      let(:new_window) { driver.window_handles.find { |handle| handle != driver.window_handle } }

      it 'should find the active element' do
        driver.navigate.to url_for('xhtmlTest.html')
        expect(driver.switch_to.active_element).to be_an_instance_of(WebDriver::Element)
      end

      # Doesn't switch to frame by id directly
      it 'should switch to a frame directly' do
        driver.navigate.to url_for('iframes.html')
        driver.switch_to.frame('iframe1')

        expect(driver.find_element(name: 'login')).to be_kind_of(WebDriver::Element)
      end

      it 'should switch to a frame by Element' do
        driver.navigate.to url_for('iframes.html')

        iframe = driver.find_element(tag_name: 'iframe')
        driver.switch_to.frame(iframe)

        expect(driver.find_element(name: 'login')).to be_kind_of(WebDriver::Element)
      end

      it 'should switch to parent frame' do
        driver.navigate.to url_for('iframes.html')

        iframe = driver.find_element(tag_name: 'iframe')
        driver.switch_to.frame(iframe)

        expect(driver.find_element(name: 'login')).to be_kind_of(WebDriver::Element)

        driver.switch_to.parent_frame
        expect(driver.find_element(id: 'iframe_page_heading')).to be_kind_of(WebDriver::Element)
      end

      context 'window switching' do
        after do
          sleep 1 if ENV['TRAVIS']
          quit_driver
        end

        describe '#new_window' do
          it 'should switch to a new window' do
            original_window = driver.window_handle
            driver.switch_to.new_window(:window)

            expect(driver.window_handles.size).to eq 2
            expect(driver.window_handle).not_to eq original_window
          end

          it 'should switch to a new tab' do
            original_window = driver.window_handle
            driver.switch_to.new_window(:tab)

            expect(driver.window_handles.size).to eq 2
            expect(driver.window_handle).not_to eq original_window
          end

          it 'should raise exception when the new window type is not recognized' do
            expect {
              driver.switch_to.new_window(:unknown)
            }.to raise_error(ArgumentError)
          end

          it 'should switch to the new window then close it when given a block' do
            original_window = driver.window_handle

            driver.switch_to.new_window do
              expect(driver.window_handles.size).to eq 2
            end

            expect(driver.window_handles.size).to eq 1
            expect(driver.window_handle).to eq original_window
          end

          it 'should not error if switching to a new window with a block that closes window' do
            expect {
              driver.switch_to.new_window { driver.close }
            }.not_to raise_exception
          end
        end

        it 'should switch to a window and back when given a block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          driver.switch_to.window(new_window) do
            wait.until { driver.title == 'We Arrive Here' }
          end

          wait.until { driver.title == 'XHTML Test Page' }
        end

        it 'should handle exceptions inside the block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          expect {
            driver.switch_to.window(new_window) { raise 'foo' }
          }.to raise_error(RuntimeError, 'foo')

          expect(driver.title).to eq('XHTML Test Page')
        end

        it 'should switch to a window without a block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          driver.switch_to.window(new_window)
          wait.until { driver.title == 'We Arrive Here' }
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'should use the original window if the block closes the popup' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          driver.switch_to.window(new_window) do
            wait.until { driver.title == 'We Arrive Here' }
            driver.close
          end

          expect(driver.current_url).to include('xhtmlTest.html')
          expect(driver.title).to eq('XHTML Test Page')
        end
      end

      context 'with more than two windows', except: [{browser: %i[safari safari_preview]},
                                                     {driver: :remote, browser: :ie}] do
        after do
          # We need to reset driver because browsers behave differently
          # when trying to open the same blank target in a new window.
          # Sometimes it's opened in a new window (Firefox 55), sometimes
          # in the same window (Firefox 57). In any event, this has nothing
          # to do with Selenium test.
          sleep 1 if ENV['TRAVIS']
          reset_driver!
        end

        it 'should close current window when more than two windows exist' do
          driver.navigate.to url_for('xhtmlTest.html')
          wait_for_element(link: 'Create a new anonymous window')
          driver.find_element(link: 'Create a new anonymous window').click
          wait.until { driver.window_handles.size == 2 }
          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 3 }

          driver.switch_to.window(driver.window_handle) { driver.close }
          expect(driver.window_handles.size).to eq 2
        end

        it 'should close another window when more than two windows exist' do
          driver.navigate.to url_for('xhtmlTest.html')
          wait_for_element(link: 'Create a new anonymous window')
          driver.find_element(link: 'Create a new anonymous window').click
          wait.until { driver.window_handles.size == 2 }
          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 3 }

          window_to_close = driver.window_handles.last

          driver.switch_to.window(window_to_close) { driver.close }
          expect(driver.window_handles.size).to eq 2
        end

        it 'should iterate over open windows when current window is not closed' do
          driver.navigate.to url_for('xhtmlTest.html')
          wait_for_element(link: 'Create a new anonymous window')
          driver.find_element(link: 'Create a new anonymous window').click
          wait.until { driver.window_handles.size == 2 }
          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 3 }

          titles = {}
          driver.window_handles.each do |wh|
            driver.switch_to.window(wh) { titles[driver.title] = driver.window_handle }
          end

          handle = titles['We Arrive Here']

          driver.switch_to.window(handle)
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'should iterate over open windows when current window is closed' do
          driver.navigate.to url_for('xhtmlTest.html')
          wait_for_element(link: 'Create a new anonymous window')
          driver.find_element(link: 'Create a new anonymous window').click
          wait.until { driver.window_handles.size == 2 }
          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 3 }

          driver.close

          titles = {}
          driver.window_handles.each do |wh|
            driver.switch_to.window(wh) { titles[driver.title] = wh }
          end

          handle = titles['We Arrive Here']
          driver.switch_to.window(handle)
          expect(driver.title).to eq('We Arrive Here')
        end
      end

      it 'should switch to a window and execute a block when current window is closed' do
        driver.navigate.to url_for('xhtmlTest.html')
        driver.find_element(link: 'Open new window').click
        wait.until { driver.window_handles.size == 2 }

        driver.switch_to.window(new_window)
        wait.until { driver.title == 'We Arrive Here' }

        driver.close

        driver.switch_to.window(driver.window_handles.first) do
          wait.until { driver.title == 'XHTML Test Page' }
        end

        expect(driver.title).to eq('XHTML Test Page')
      end

      it 'should switch to default content' do
        driver.navigate.to url_for('iframes.html')

        driver.switch_to.frame 0
        driver.switch_to.default_content

        driver.find_element(id: 'iframe_page_heading')
      end

      # Edge BUG - https://connect.microsoft.com/IE/feedback/details/1850030
      describe 'alerts' do
        it 'allows the user to accept an alert' do
          driver.navigate.to url_for('alerts.html')
          driver.find_element(id: 'alert').click

          alert = wait_for_alert
          alert.accept
          wait_for_no_alert

          expect(driver.title).to eq('Testing Alerts')
        end

        it 'allows the user to dismiss an alert' do
          driver.navigate.to url_for('alerts.html')
          driver.find_element(id: 'alert').click

          alert = wait_for_alert
          alert.dismiss
          wait_for_no_alert

          expect(driver.title).to eq('Testing Alerts')
        end

        it 'allows the user to set the value of a prompt' do
          driver.navigate.to url_for('alerts.html')
          driver.find_element(id: 'prompt').click

          alert = wait_for_alert
          alert.send_keys 'cheese'
          alert.accept

          text = driver.find_element(id: 'text').text
          expect(text).to eq('cheese')
        end

        it 'allows the user to get the text of an alert' do
          driver.navigate.to url_for('alerts.html')
          driver.find_element(id: 'alert').click

          alert = wait_for_alert
          text = alert.text
          alert.accept

          expect(text).to eq('cheese')
          wait_for_no_alert
        end

        it 'raises when calling #text on a closed alert' do
          driver.navigate.to url_for('alerts.html')
          wait_for_element(id: 'alert')

          driver.find_element(id: 'alert').click

          alert = wait_for_alert
          alert.accept

          wait_for_no_alert
          expect { alert.text }.to raise_error(Selenium::WebDriver::Error::NoSuchAlertError)
        end

        it 'raises NoAlertOpenError if no alert is present' do
          expect { driver.switch_to.alert }.to raise_error(Selenium::WebDriver::Error::NoSuchAlertError)
        end

        context 'unhandled alert error' do
          after { reset_driver! }

          it 'raises an UnexpectedAlertOpenError if an alert has not been dealt with' do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'alert').click
            wait_for_alert

            expect { driver.title }.to raise_error(Selenium::WebDriver::Error::UnexpectedAlertOpenError)
          end
        end
      end
    end
  end # WebDriver
end # Selenium
