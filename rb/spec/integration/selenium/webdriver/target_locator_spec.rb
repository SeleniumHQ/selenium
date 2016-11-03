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
    describe TargetLocator do
      after do
        ensure_single_window
      end

      let(:new_window) { driver.window_handles.find { |handle| handle != driver.window_handle } }

      # Server - https://github.com/SeleniumHQ/selenium/issues/2555
      # Server - https://github.com/SeleniumHQ/selenium/issues/1795
      not_compliant_on browser: :safari do
        not_compliant_on driver: :remote, browser: [:edge, :firefox] do
          it 'should find the active element' do
            driver.navigate.to url_for('xhtmlTest.html')
            expect(driver.switch_to.active_element).to be_an_instance_of(WebDriver::Element)
          end
        end
      end

      # Doesn't switch to frame by id directly
      not_compliant_on browser: :safari do
        it 'should switch to a frame directly' do
          driver.navigate.to url_for('iframes.html')
          driver.switch_to.frame('iframe1')

          expect(driver.find_element(name: 'login')).to be_kind_of(WebDriver::Element)
        end
      end

      it 'should switch to a frame by Element' do
        driver.navigate.to url_for('iframes.html')

        iframe = driver.find_element(tag_name: 'iframe')
        driver.switch_to.frame(iframe)

        expect(driver.find_element(name: 'login')).to be_kind_of(WebDriver::Element)
      end

      not_compliant_on browser: :phantomjs do
        it 'should switch to parent frame' do
          driver.navigate.to url_for('iframes.html')

          iframe = driver.find_element(tag_name: 'iframe')
          driver.switch_to.frame(iframe)

          expect(driver.find_element(name: 'login')).to be_kind_of(WebDriver::Element)

          driver.switch_to.parent_frame
          expect(driver.find_element(id: 'iframe_page_heading')).to be_kind_of(WebDriver::Element)
        end
      end

      # Safari Note - Ensure Popup Blocker turned off to prevent failures
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

      not_compliant_on browser: :safari do
        it 'should handle exceptions inside the block' do
          driver.navigate.to url_for('xhtmlTest.html')

          driver.find_element(link: 'Open new window').click
          wait.until { driver.window_handles.size == 2 }
          expect(driver.title).to eq('XHTML Test Page')

          expect do
            driver.switch_to.window(new_window) { raise 'foo' }
          end.to raise_error(RuntimeError, 'foo')

          expect(driver.title).to eq('XHTML Test Page')
        end
      end

      it 'should switch to a window without a block' do
        driver.navigate.to url_for('xhtmlTest.html')

        driver.find_element(link: 'Open new window').click
        wait.until { driver.window_handles.size == 2 }
        expect(driver.title).to eq('XHTML Test Page')

        driver.switch_to.window(new_window)
        expect(driver.title).to eq('We Arrive Here')
      end

      not_compliant_on browser: :safari do
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

      # Firefox - https://bugzilla.mozilla.org/show_bug.cgi?id=1280517
      not_compliant_on browser: [:firefox, :ie, :safari] do
        context 'with more than two windows' do
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

            matching_window = driver.window_handles.find do |wh|
              driver.switch_to.window(wh) { driver.title == 'We Arrive Here' }
            end

            driver.switch_to.window(matching_window)
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

            matching_window = driver.window_handles.find do |wh|
              driver.switch_to.window(wh) { driver.title == 'We Arrive Here' }
            end

            driver.switch_to.window(matching_window)
            expect(driver.title).to eq('We Arrive Here')
          end
        end
      end

      not_compliant_on browser: :safari do
        not_compliant_on driver: :remote, browser: :firefox do
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
        end
      end

      it 'should switch to default content' do
        driver.navigate.to url_for('iframes.html')

        driver.switch_to.frame 0
        driver.switch_to.default_content

        driver.find_element(id: 'iframe_page_heading')
      end

      # Edge BUG - https://connect.microsoft.com/IE/feedback/details/1850030
      not_compliant_on browser: :phantomjs do
        describe 'alerts' do
          it 'allows the user to accept an alert' do
            driver.navigate.to url_for('alerts.html')
            driver.find_element(id: 'alert').click

            alert = wait_for_alert
            alert.accept
            wait_for_no_alert

            expect(driver.title).to eq('Testing Alerts')
          end

          not_compliant_on browser: :chrome, platform: :macosx do
            it 'allows the user to dismiss an alert' do
              driver.navigate.to url_for('alerts.html')
              driver.find_element(id: 'alert').click

              alert = wait_for_alert
              alert.dismiss
              wait_for_no_alert

              expect(driver.title).to eq('Testing Alerts')
            end
          end

          # Firefox - https://bugzilla.mozilla.org/show_bug.cgi?id=1255906
          # Edge Under Consideration - https://dev.windows.com/en-us/microsoft-edge/platform/status/webdriver/details/
          not_compliant_on browser: [:firefox, :edge] do
            it 'allows the user to set the value of a prompt' do
              driver.navigate.to url_for('alerts.html')
              driver.find_element(id: 'prompt').click

              alert = wait_for_alert
              alert.send_keys 'cheese'
              alert.accept

              text = driver.find_element(id: 'text').text
              expect(text).to eq('cheese')
            end
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

          # Safari - Raises wrong error
          not_compliant_on browser: :safari do
            not_compliant_on driver: :remote, browser: :firefox do
              it 'raises when calling #text on a closed alert' do
                driver.navigate.to url_for('alerts.html')
                wait_for_element(id: 'alert')

                driver.find_element(id: 'alert').click

                alert = wait_for_alert
                alert.accept

                wait_for_no_alert
                expect { alert.text }.to raise_error(Selenium::WebDriver::Error::NoSuchAlertError)
              end
            end
          end

          not_compliant_on driver: :remote, browser: :firefox do
            not_compliant_on browser: :ie do
              it 'raises NoAlertOpenError if no alert is present' do
                expect { driver.switch_to.alert }.to raise_error(Selenium::WebDriver::Error::NoSuchAlertError, /alert|modal/i)
              end
            end
          end

          # Safari - Raises wrong error
          # Firefox - https://bugzilla.mozilla.org/show_bug.cgi?id=1279211
          not_compliant_on browser: [:firefox, :safari] do
            it 'raises an UnhandledAlertError if an alert has not been dealt with' do
              driver.navigate.to url_for('alerts.html')
              driver.find_element(id: 'alert').click
              wait_for_alert

              expect { driver.title }.to raise_error(Selenium::WebDriver::Error::UnhandledAlertError)

              not_compliant_on browser: [:ff_legacy, :ie] do
                driver.switch_to.alert.accept
              end

              compliant_on browser: :ff_legacy do
                reset_driver!
              end
            end
          end
        end
      end

      compliant_on browser: :ie do
        # Windows 10 changed the auth alert
        not_compliant_on browser: :ie do
          describe 'basic auth alerts' do
            after { reset_driver! }

            it 'allows the user to send valid credentials to an alert' do
              driver.navigate.to url_for('basicAuth')
              driver.switch_to.alert.authenticate('test', 'test')

              expect(driver.find_element(tag_name: 'h1').text).to eq('authorized')
            end

            it 'does not raise an error when invalid credentials are used' do
              driver.navigate.to url_for('basicAuth')
              driver.switch_to.alert.authenticate('invalid', 'invalid')

              wait = Selenium::WebDriver::Wait.new(timeout: 5, ignore: Selenium::WebDriver::Error::NoSuchAlertError)
              wait.until { driver.switch_to.alert }

              expect { driver.switch_to.alert.dismiss }.to_not raise_error
            end
          end
        end
      end
    end
  end # WebDriver
end # Selenium
