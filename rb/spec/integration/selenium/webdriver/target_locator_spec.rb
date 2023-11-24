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
      before { @original_window = driver.window_handle }

      after do
        handles = driver.window_handles
        driver.switch_to.window(@original_window) if handles.include?(@original_window)

        (handles - [driver.window_handle]).each do |handle|
          driver.switch_to.window(handle) { driver.close }
        end
      end

      let(:new_window) { driver.window_handles.find { |handle| handle != driver.window_handle } }

      it 'finds the active element' do
        driver.navigate.to url_for('xhtmlTest.html')
        expect(driver.switch_to.active_element).to be_an_instance_of(WebDriver::Element)
      end

      # Doesn't switch to frame by id directly
      it 'switches to a frame directly' do
        driver.navigate.to url_for('iframes.html')
        driver.switch_to.frame('iframe1')

        expect(driver.find_element(name: 'login')).to be_a(WebDriver::Element)
      end

      it 'switches to a frame by Element' do
        driver.navigate.to url_for('iframes.html')

        iframe = driver.find_element(tag_name: 'iframe')
        driver.switch_to.frame(iframe)

        expect(driver.find_element(name: 'login')).to be_a(WebDriver::Element)
      end

      it 'switches to parent frame' do
        driver.navigate.to url_for('iframes.html')

        iframe = driver.find_element(tag_name: 'iframe')
        driver.switch_to.frame(iframe)

        expect(driver.find_element(name: 'login')).to be_a(WebDriver::Element)

        driver.switch_to.parent_frame
        expect(driver.find_element(id: 'iframe_page_heading')).to be_a(WebDriver::Element)
      end

      context 'when switching windows' do
        describe '#new_window' do
          it 'switches to a new window' do
            driver.switch_to.new_window(:window)

            expect(driver.window_handles.size).to eq 2
            expect(driver.window_handle).not_to eq @original_window
          end

          it 'switches to a new tab' do
            driver.switch_to.new_window(:tab)

            expect(driver.window_handles.size).to eq 2
            expect(driver.window_handle).not_to eq @original_window
          end

          it 'raises exception when the new window type is not recognized' do
            expect {
              driver.switch_to.new_window(:unknown)
            }.to raise_error(ArgumentError)
          end

          it 'switches to the new window then close it when given a block' do
            driver.switch_to.new_window do
              expect(driver.window_handles.size).to eq 2
            end

            expect(driver.window_handles.size).to eq 1
            expect(driver.window_handle).to eq @original_window
          end

          it 'does not error if switching to a new window with a block that closes window' do
            expect {
              driver.switch_to.new_window { driver.close }
            }.not_to raise_exception
          end
        end

        it 'switches to a window and back when given a block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          driver.switch_to.window(new_window) do
            wait.until { driver.title == 'We Arrive Here' }
          end

          wait.until { driver.title == 'XHTML Test Page' }
        end

        it 'handles exceptions inside the block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          expect {
            driver.switch_to.window(new_window) { raise 'foo' }
          }.to raise_error(RuntimeError, 'foo')

          expect(driver.title).to eq('XHTML Test Page')
        end

        it 'switches to a window without a block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          driver.switch_to.window(new_window)
          wait.until { driver.title == 'We Arrive Here' }
          expect(driver.title).to eq('We Arrive Here')
        end

        it 'uses the original window if the block closes the popup' do
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
        it 'closes current window via block' do
          driver.navigate.to url_for('xhtmlTest.html')
          wait_for_element(link: 'Create a new anonymous window')
          driver.find_element(link: 'Create a new anonymous window').click
          wait.until { driver.window_handles.size == 2 }
          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 3 }
          driver.switch_to.window(new_window)

          driver.switch_to.window(driver.window_handle) { driver.close }
          expect(driver.window_handles.size).to eq 2
        end

        it 'closes another window' do
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

        it 'iterates over open windows when current window is not closed' do
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

        it 'iterates over open windows when current window is closed' do
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

      it 'switches to a window and execute a block when current window is closed' do
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

      it 'switches to default content' do
        driver.navigate.to url_for('iframes.html')

        driver.switch_to.frame 0
        driver.switch_to.default_content

        expect(driver.find_elements(id: 'iframe_page_heading').size).to be_positive
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

        describe 'unhandled alert error' do
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
