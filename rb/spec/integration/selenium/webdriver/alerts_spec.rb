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
    describe Alerts, exclude: {browser_family: :safari, reason: 'Safari sends no BiDi user prompt events'},
                     skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
      let(:seen) { Queue.new }
      let(:handles) { [] }

      after { handles.each { |handle| driver.alerts.remove_handler(handle) } }

      def add_handler(driver = self.driver, &block)
        driver.alerts.add_handler(&block).tap { |handle| handles << handle }
      end

      def open_alert(id, driver = self.driver)
        driver.navigate.to url_for('alerts.html')
        driver.find_element(id: id).click
      end

      def alert_text(driver)
        Wait.new(timeout: 5, ignore: Error::NoSuchAlertError).until { driver.switch_to.alert.text }
      end

      def open_before_unload_page(driver = self.driver)
        driver.navigate.to url_for('pageWithOnBeforeUnloadMessage.html')
        # the browser only shows the prompt after the user has interacted with the page
        driver.find_element(css: 'body').send_keys('a')
      end

      describe 'adds and removes a handler through driver.alerts' do
        it 'adds a handler that returns a handle and removes it by that handle' do
          handle = driver.alerts.add_handler do |alert|
            alert.accept
            seen << alert
          end
          open_alert('alert')
          expect(seen.pop.text).to eq('cheese')
          expect(driver.title).to eq('Testing Alerts')

          expect(driver.alerts.remove_handler(handle)).to be_nil
          driver.find_element(id: 'alert').click
          expect(wait_for_alert.text).to eq('cheese')
          driver.switch_to.alert.accept
        end
      end

      describe 'gives the handler an alert object that acts on the alert that triggered it' do
        it 'reads the type, default value and text, and sends keys' do
          add_handler do |alert|
            alert.send_keys('Tasty cheese')
            alert.accept
            seen << [alert.class, alert.type, alert.default_value, alert.text]
          end
          open_alert('prompt-with-default')

          expect(seen.pop).to eq([Alert, 'prompt', 'This is a default value', 'Enter something'])
          expect(driver.find_element(id: 'text').text).to eq('Tasty cheese')
        end

        it 'accepts a prompt with its default value' do
          add_handler do |alert|
            alert.accept
            seen << alert
          end
          open_alert('prompt-with-default')

          seen.pop
          expect(driver.find_element(id: 'text').text).to eq('This is a default value')
        end

        it 'raises when sending keys to an alert that is not a prompt' do
          add_handler { |alert| seen << alert }
          open_alert('alert')
          alert = seen.pop

          expect { alert.send_keys('cheddar') }.to raise_error(Error::ElementNotInteractableError)
          alert.accept
        end

        it 'acts on an alert opened in a frame' do
          add_handler do |alert|
            alert.accept
            seen << alert.text
          end
          driver.navigate.to url_for('alerts.html')
          driver.switch_to.frame(driver.find_element(name: 'iframeWithAlert'))
          driver.find_element(id: 'alertInFrame').click

          expect(seen.pop).to eq('framed cheese')
          driver.switch_to.default_content
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'dismisses' do
          add_handler do |alert|
            alert.dismiss
            seen << alert.type
          end
          open_alert('confirm')

          expect(seen.pop).to eq('confirm')
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'acts on the alert that triggered it when the driver is on another window' do
          add_handler do |alert|
            alert.accept
            seen << alert.text
          end
          driver.navigate.to url_for('alerts.html')
          original = driver.window_handle
          driver.execute_script("window.setTimeout(function() { alert('other window'); }, 1000);")
          driver.switch_to.new_window(:window)

          expect(seen.pop).to eq('other window')
          driver.close
          driver.switch_to.window(original)
          expect(driver.title).to eq('Testing Alerts')
        end
      end

      describe 'supports the Alert API with no handler however the alert was opened' do
        it 'handles an alert opened by a classic command' do
          open_alert('alert')

          alert = wait_for_alert
          expect(alert.text).to eq('cheese')
          alert.accept
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'handles an alert opened by a BiDi command' do
          driver.navigate.to url_for('pageWithOnLoad.html')

          alert = wait_for_alert
          expect(alert.text).to eq('onload')
          alert.accept
          expect(driver.find_element(css: 'p').text).to eq('Page with onload event handler')
        end

        it 'reads the type and default value' do
          open_alert('prompt-with-default')

          alert = wait_for_alert
          expect([alert.type, alert.default_value]).to eq(['prompt', 'This is a default value'])
          alert.dismiss
        end

        it 'sends keys to a prompt' do
          open_alert('prompt')

          alert = wait_for_alert
          alert.send_keys('cheddar')
          alert.accept
          expect(driver.find_element(id: 'text').text).to eq('cheddar')
        end

        it 'handles an alert that opens as the previous one closes' do
          open_alert('double-prompt')

          %w[first second].each do |keys|
            alert = wait_for_alert
            alert.send_keys(keys)
            alert.accept
          end
          expect(driver.find_element(id: 'text2').text).to eq('second')
        end

        it 'handles an alert opened in a frame' do
          driver.navigate.to url_for('alerts.html')
          driver.switch_to.frame(driver.find_element(name: 'iframeWithAlert'))
          driver.find_element(id: 'alertInFrame').click

          alert = wait_for_alert
          expect(alert.text).to eq('framed cheese')
          alert.accept
          driver.switch_to.default_content
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'leaves the commands for another window alone' do
          driver.navigate.to url_for('alerts.html')
          original = driver.window_handle
          driver.execute_script("window.setTimeout(function() { alert('other window'); }, 500);")
          driver.switch_to.new_window(:window)
          sleep 1

          driver.navigate.to url_for('simpleTest.html')
          driver.navigate.refresh
          expect(driver.title).to eq('Hello WebDriver')
        ensure
          driver.close
          driver.switch_to.window(original)
          wait_for_alert.accept
        end
      end

      describe 'applies unhandledPromptBehavior on the client' do
        # what the prompt returns to the page once the behavior has closed the dialog
        accepted = {'alert' => '', 'confirm' => 'Hello WebDriver', 'prompt' => ''}
        dismissed = {'alert' => '', 'confirm' => 'Testing Alerts', 'prompt' => 'null'}

        def result_of(id, driver)
          return driver.find_element(id: 'text').text unless id == 'confirm'

          # accepting the confirm follows the link, which takes a moment to change the page
          Wait.new(timeout: 2).until { driver.title == 'Hello WebDriver' }
          driver.title
        rescue Error::TimeoutError
          driver.title
        end

        {'dismiss' => dismissed, 'accept' => accepted}.each do |behavior, results|
          it "closes the dialog and runs the command with '#{behavior}'" do
            driver = local_driver(unhandled_prompt_behavior: behavior)
            results.each do |id, result|
              open_alert(id, driver)
              expect(result_of(id, driver)).to eq(result)
            end
          end

          it "closes the dialog and raises with '#{behavior} and notify'" do
            driver = local_driver(unhandled_prompt_behavior: "#{behavior} and notify")
            results.each do |id, result|
              open_alert(id, driver)
              expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
              expect(result_of(id, driver)).to eq(result)
            end
          end
        end

        it "raises and leaves the dialog open with 'ignore'" do
          driver = local_driver(unhandled_prompt_behavior: 'ignore')
          %w[alert confirm prompt].each do |id|
            open_alert(id, driver)
            alert_text(driver)
            expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
            expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
            driver.switch_to.alert.dismiss
          end
        end

        it 'logs the alert it closes' do
          driver = local_driver(unhandled_prompt_behavior: 'accept')
          open_alert('alert', driver)

          expect { driver.title }.to have_info(:alerts, "Closing alert 'cheese' for unhandledPromptBehavior 'accept'")
        end

        it "defaults to 'dismiss and notify'" do
          {'alert' => '', 'confirm' => 'Testing Alerts', 'prompt' => 'null'}.each do |id, result|
            open_alert(id)
            expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
            expect(result_of(id, driver)).to eq(result)
          end
        end

        # whether the BiDi command raises, and what the prompt returns to the page once it is closed
        {'accept' => [false, ''], 'dismiss' => [false, 'null'], 'accept and notify' => [true, ''],
         'dismiss and notify' => [true, 'null'], 'ignore' => [true, nil]}.each do |behavior, (raises, text)|
          it "applies '#{behavior}' to a BiDi command sent while a dialog is open" do
            driver = local_driver(unhandled_prompt_behavior: behavior)
            window = driver.window_handle
            open_alert('prompt', driver)
            alert_text(driver)
            command = -> { BiDi::Protocol::BrowsingContext.new(driver).capture_screenshot(context: window) }

            if raises
              expect(&command).to raise_error(Error::UnexpectedAlertOpenError, /Enter something/)
            else
              command.call
            end
            if text
              expect(driver.find_element(id: 'text').text).to eq(text)
            else
              expect(driver.switch_to.alert.text).to eq('Enter something')
              driver.switch_to.alert.dismiss
            end
          end
        end

        it 'accepts beforeunload prompts by default' do
          open_before_unload_page
          driver.navigate.to url_for('alerts.html')

          expect(driver.title).to eq('Testing Alerts')
        end

        it 'accepts a beforeunload prompt opened by a classic command' do
          open_before_unload_page
          driver.find_element(id: 'navigate').click

          expect(driver.title).to eq('Testing Alerts')
        end

        it 'sends a BiDi command once the beforeunload prompt it waits on is accepted' do
          window = driver.window_handle
          open_before_unload_page
          driver.find_element(id: 'navigate').click

          begin
            BiDi::Protocol::BrowsingContext.new(driver).capture_screenshot(context: window)
          rescue Error::UnknownError => e
            # Chrome can lose track of the context while it navigates away from the page
            raise unless e.message.include?('Cannot find context')
          end
          wait_for_title(title: 'Testing Alerts')
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'reports the behavior it applies in the capabilities' do
          expect(driver.capabilities.unhandled_prompt_behavior).to eq('dismiss and notify')
          accepting = local_driver(unhandled_prompt_behavior: 'accept')
          expect(accepting.capabilities.unhandled_prompt_behavior).to eq('accept')
        end

        it 'deprecates the map form of the capability and applies its default entry' do
          expect {
            driver = local_driver(unhandled_prompt_behavior: {default: 'accept'})
            open_alert('prompt', driver)
            expect(driver.find_element(id: 'text').text).to eq('')
          }.to have_deprecated(:unhandled_prompt_behavior)
        end
      end

      describe 'gives a registered handler every prompt and leaves the ones it does not close to the Alert API' do
        it 'does not apply unhandledPromptBehavior' do
          add_handler { |alert| seen << alert }
          open_alert('alert')
          alert = seen.pop

          expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
          expect { driver.navigate.refresh }.to raise_error(Error::UnexpectedAlertOpenError)
          alert.accept
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'gives beforeunload prompts to the handler' do
          add_handler do |alert|
            seen << alert.type
            alert.accept
          end
          open_before_unload_page
          driver.navigate.to url_for('alerts.html')

          expect(seen.pop).to eq('beforeunload')
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'leaves an alert it does not close to the Alert API' do
          add_handler { |alert| seen << alert }
          open_alert('prompt')
          seen.pop

          alert = driver.switch_to.alert
          alert.send_keys('cheddar')
          alert.accept
          expect(driver.find_element(id: 'text').text).to eq('cheddar')
        end

        it 'returns from the BiDi command that opened an alert it does not close' do
          add_handler { |alert| seen << alert }
          driver.navigate.to url_for('pageWithOnLoad.html')

          expect(seen.pop.text).to eq('onload')
          driver.switch_to.alert.accept
          expect(driver.find_element(css: 'p').text).to eq('Page with onload event handler')
        end
      end

      describe 'calls only the most recently added handler' do
        it 'calls the newest handler, then the previous one, then restores the classic behavior' do
          add_handler do |alert|
            alert.accept
            seen << :first
          end
          second = add_handler do |alert|
            alert.accept
            seen << :second
          end

          open_alert('alert')
          expect(seen.pop).to eq(:second)
          expect(driver.title).to eq('Testing Alerts')
          expect(seen).to be_empty

          driver.alerts.remove_handler(second)
          driver.find_element(id: 'alert').click
          expect(seen.pop).to eq(:first)
          expect(driver.title).to eq('Testing Alerts')
          expect(seen).to be_empty

          driver.alerts.remove_handler(handles.first)
          driver.find_element(id: 'alert').click
          expect(wait_for_alert.text).to eq('cheese')
          expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
          expect(driver.title).to eq('Testing Alerts')
        end
      end

      describe 'raises a handler exception from the next command and leaves the alert open' do
        it 'raises an exception from the block on the next driver command' do
          add_handler do |alert|
            alert.accept
            raise ArgumentError, 'from the handler'
          end
          open_alert('alert')

          # raised by the first command sent after the handler has finished
          commands = Wait.new(timeout: 5, ignore: Error::UnexpectedAlertOpenError)
          expect { commands.until { driver.title.nil? } }.to raise_error(ArgumentError, 'from the handler')
          expect(driver.title).to eq('Testing Alerts')
        end

        it 'does not close the alert after the block returns' do
          add_handler { |alert| seen << alert }
          open_alert('prompt')
          alert = seen.pop

          expect { driver.title }.to raise_error(Error::UnexpectedAlertOpenError)
          alert.send_keys('later')
          alert.accept
          expect(driver.find_element(id: 'text').text).to eq('later')
        end
      end
    end
  end # WebDriver
end # Selenium
