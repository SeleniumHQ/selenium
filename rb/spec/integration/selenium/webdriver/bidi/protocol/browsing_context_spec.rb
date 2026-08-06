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

require_relative '../../spec_helper'
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe BrowsingContext, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:browsing_context) { described_class.new(driver) }

          def script_target(context = driver.window_handle, sandbox: nil)
            kwargs = {context: context}
            kwargs[:sandbox] = sandbox if sandbox
            Script::ContextTarget.new(**kwargs)
          end

          def evaluate(expression, context = driver.window_handle)
            Script.new(driver).evaluate(expression: expression, target: script_target(context), await_promise: false)
          end

          describe '#activate' do
            it 'activates an existing browsing context' do
              context = browsing_context.create(type: :tab, background: true).context

              expect(browsing_context.activate(context: context)).to be_empty
              expect(driver.window_handles).to include(context)
            end
          end

          describe '#capture_screenshot',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari does not implement browsingContext.captureScreenshot'} do
            it 'returns base64 PNG screenshot data' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('blank.html'), wait: :complete)

              result = browsing_context.capture_screenshot(context: driver.window_handle)

              expect(result).to be_a(BrowsingContext::CaptureScreenshotResult)
              expect(result.data).to start_with('iVBOR')
            end

            it 'accepts viewport origin, image format, and box clip parameters' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('blank.html'), wait: :complete)

              result = browsing_context.capture_screenshot(
                context: driver.window_handle,
                origin: :viewport,
                format: BrowsingContext::ImageFormat.new(type: 'image/png'),
                clip: BrowsingContext::BoxClipRectangle.new(x: 0, y: 0, width: 100, height: 100)
              )

              expect(result.data).to start_with('iVBOR')
            end
          end

          describe '#close' do
            it 'closes a created tab' do
              context = browsing_context.create(type: :tab).context

              browsing_context.close(context: context)

              expect(driver.window_handles).not_to include(context)
            end

            it 'accepts the prompt unload option' do
              context = browsing_context.create(type: :tab).context

              expect(browsing_context.close(context: context, prompt_unload: false)).to be_empty
              expect(driver.window_handles).not_to include(context)
            end
          end

          describe '#create' do
            it 'creates a tab context' do
              result = browsing_context.create(type: :tab)

              expect(result).to be_a(BrowsingContext::CreateResult)
              expect(driver.window_handles).to include(result.context)
            end

            it 'creates a window context' do
              result = browsing_context.create(type: :window)

              expect(result.context).to be_a(String)
              expect(driver.window_handles).to include(result.context)
            end

            it 'accepts reference, background, and user context parameters',
               pending_if: {browser_family: :safari,
                            exception: {class: Error::SerializationError},
                            reason: 'Safari create_user_context result fails strict deserialization'} do
              user_context = Browser.new(driver).create_user_context.user_context

              result = browsing_context.create(
                type: :tab,
                reference_context: driver.window_handle,
                background: true,
                user_context: user_context
              )

              expect(driver.window_handles).to include(result.context)
              expect(browsing_context.get_tree(root: result.context).contexts.first.user_context).to eq(user_context)
            ensure
              browsing_context.close(context: result.context) if result&.context
              Browser.new(driver).remove_user_context(user_context: user_context) if user_context
            end
          end

          describe '#get_tree' do
            it 'returns the current context tree' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('iframes.html'), wait: :complete)

              result = browsing_context.get_tree(root: driver.window_handle)

              expect(result.contexts).to contain_exactly(be_a(BrowsingContext::Info))
              expect(result.contexts.first.context).to eq(driver.window_handle)
              expect(result.contexts.first.url).to include('iframes.html')
              expect(result.contexts.first.children).not_to be_empty
            end

            it 'accepts max depth and root parameters' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('iframes.html'), wait: :complete)

              result = browsing_context.get_tree(max_depth: 0, root: driver.window_handle)

              expect(result.contexts.size).to eq(1)
              expect(result.contexts.first.context).to eq(driver.window_handle)
              expect(result.contexts.first.children).to be_nil.or be_empty
            end
          end

          describe '#handle_user_prompt' do
            it 'returns a no such alert error when no prompt is open' do
              expect {
                browsing_context.handle_user_prompt(context: driver.window_handle, accept: true)
              }.to raise_error(Error::NoSuchAlertError)
            end

            it 'accepts user prompts without text',
               pending_if: {browser_family: :chromium,
                            reason: 'https://github.com/GoogleChromeLabs/chromium-bidi/issues/3281'} do
              driver.navigate.to url_for('alerts.html')
              driver.find_element(id: 'alert').click
              wait_for_alert
              browsing_context.handle_user_prompt(context: driver.window_handle, accept: true)
              wait_for_no_alert

              expect(driver.title).to eq('Testing Alerts')
            end

            it 'accepts user prompts with text',
               pending_if: {browser_family: :chromium,
                            reason: 'https://github.com/GoogleChromeLabs/chromium-bidi/issues/3281'} do
              driver.navigate.to url_for('alerts.html')
              driver.find_element(id: 'prompt').click
              wait_for_alert
              browsing_context.handle_user_prompt(
                context: driver.window_handle,
                accept: true,
                user_text: 'Hello, world!'
              )
              wait_for_no_alert

              expect(driver.title).to eq('Testing Alerts')
            end

            it 'rejects user prompts',
               pending_if: {browser_family: :chromium,
                            reason: 'https://github.com/GoogleChromeLabs/chromium-bidi/issues/3281'} do
              driver.navigate.to url_for('alerts.html')
              driver.find_element(id: 'alert').click
              wait_for_alert
              browsing_context.handle_user_prompt(context: driver.window_handle, accept: false)
              wait_for_no_alert

              expect(driver.title).to eq('Testing Alerts')
            end
          end

          describe '#locate_nodes',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari does not implement browsingContext.locateNodes'} do
            it 'finds nodes by CSS selector' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('xhtmlTest.html'), wait: :complete)

              result = browsing_context.locate_nodes(
                context: driver.window_handle,
                locator: BrowsingContext::CssLocator.new(value: 'div.content'),
                max_node_count: 1
              )

              expect(result.nodes).to contain_exactly(be_a(Script::NodeRemoteValue))
              expect(result.nodes.first.value.local_name).to eq('div')
              expect(result.nodes.first.value.attributes).to include('class' => 'content')
              expect(result.nodes.first.shared_id).to be_a(String)
            end

            it 'accepts serialization options and start nodes' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)
              forms = browsing_context.locate_nodes(
                context: driver.window_handle,
                locator: BrowsingContext::CssLocator.new(value: 'form'),
                max_node_count: 1
              )
              start_node = Script::SharedReference.new(shared_id: forms.nodes.first.shared_id)

              result = browsing_context.locate_nodes(
                context: driver.window_handle,
                locator: BrowsingContext::CssLocator.new(value: 'input'),
                max_node_count: 3,
                serialization_options: Script::SerializationOptions.new(max_dom_depth: 0),
                start_nodes: [start_node]
              )

              expect(result.nodes.size).to eq(3)
              expect(result.nodes.map { |node| node.value.local_name }.uniq).to eq(['input'])
            end
          end

          describe '#navigate' do
            it 'navigates a context to a URL' do
              result = browsing_context.navigate(
                context: driver.window_handle,
                url: url_for('formPage.html'),
                wait: :complete
              )

              expect(result).to be_a(BrowsingContext::NavigateResult)
              expect(result.url).to eq(url_for('formPage.html'))
              expect(driver.find_element(name: 'login')).to be_displayed
            end
          end

          describe '#print',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari does not implement browsingContext.print'} do
            it 'returns base64 PDF data' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('printPage.html'), wait: :complete)

              result = browsing_context.print(context: driver.window_handle)

              expect(result).to be_a(BrowsingContext::PrintResult)
              expect(result.data).to start_with('JVBER')
            end

            it 'accepts page layout parameters' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('printPage.html'), wait: :complete)

              result = browsing_context.print(
                context: driver.window_handle,
                background: true,
                margin: BrowsingContext::PrintMarginParameters.new(top: 0.5, bottom: 0.5, left: 0.5, right: 0.5),
                orientation: :landscape,
                page: BrowsingContext::PrintPageParameters.new(width: 8.5, height: 11),
                page_ranges: ['1'],
                scale: 1.0,
                shrink_to_fit: true
              )

              expect(result.data).to start_with('JVBER')
            end
          end

          describe '#reload' do
            it 'reloads a context',
               pending_if: {browser: :firefox,
                            exception: {class: Error::UnsupportedOperationError,
                                        message: /Argument "ignoreCache" /},
                            reason: 'Firefox lacks browsingContext.reload ignoreCache (bugzilla 1851561)'} do
              browsing_context.navigate(context: driver.window_handle, url: url_for('formPage.html'), wait: :complete)

              result = browsing_context.reload(context: driver.window_handle, ignore_cache: true, wait: :complete)

              expect(result.url).to eq(url_for('formPage.html'))
              expect(driver.find_element(name: 'login')).to be_displayed
            end
          end

          describe '#set_bypass_csp',
                   pending_if: [{browser: :chrome,
                                 exception: {class: Error::UnsupportedOperationError,
                                             message: /browsingContext\.setBypassCSP/},
                                 reason: 'Chrome returns unsupported operation for browsingContext.setBypassCSP'},
                                {browser: %i[edge firefox],
                                 exception: {class: Error::UnknownCommandError},
                                 reason: 'Edge and Firefox return unknown command for browsingContext.setBypassCSP'},
                                {browser_family: :safari,
                                 exception: {class: Error::UnknownCommandError},
                                 reason: 'Safari does not implement browsingContext.setBypassCSP'}] do
            it 'sets and clears CSP bypass for a context' do
              expect(browsing_context.set_bypass_csp(bypass: true, contexts: [driver.window_handle])).to be_empty
              expect(browsing_context.set_bypass_csp(bypass: nil, contexts: [driver.window_handle])).to be_empty
            end
          end

          describe '#set_viewport' do
            it 'sets the viewport size and device pixel ratio',
               pending_if: {browser_family: :safari,
                            reason: 'Safari accepts browsingContext.setViewport but does not resize the window'} do
              browsing_context.set_viewport(
                context: driver.window_handle,
                viewport: BrowsingContext::Viewport.new(width: 800, height: 600),
                device_pixel_ratio: 2.0
              )

              expect(evaluate('[window.innerWidth, window.innerHeight]').result.value.map(&:value)).to eq([800, 600])
            end

            it 'clears the viewport override' do
              browsing_context.set_viewport(
                context: driver.window_handle,
                viewport: BrowsingContext::Viewport.new(width: 640, height: 480)
              )

              expect(browsing_context.set_viewport(context: driver.window_handle, viewport: nil)).to be_empty
            end
          end

          describe '#start_screencast',
                   pending_if: [{browser: :chrome,
                                 exception: {class: Error::UnsupportedOperationError,
                                             message: /browsingContext\.startScreencast/},
                                 reason: 'Chrome returns unsupported operation for browsingContext.startScreencast'},
                                {browser: :edge,
                                 exception: {class: Error::UnknownCommandError},
                                 reason: 'Edge returns unknown command for browsingContext.startScreencast'},
                                {browser_family: :safari,
                                 exception: {class: Error::UnknownCommandError},
                                 reason: 'Safari does not implement browsingContext.startScreencast'}] do
            it 'starts and stops a screencast' do
              result = browsing_context.start_screencast(
                context: driver.window_handle,
                mime_type: 'video/webm',
                video: BrowsingContext::MediaTrackConstraints.new(width: 320, height: 240, frame_rate: 5),
                audio: false
              )

              expect(result.screencast).to be_a(String)
              expect(browsing_context.stop_screencast(screencast: result.screencast)).to be_a(
                BrowsingContext::StopScreencastResult
              )
            end
          end

          describe '#traverse_history',
                   skip_if: {browser_family: :safari,
                             reason: 'Times out: browsingContext.traverseHistory hangs on Safari'} do
            it 'moves backward and forward in the context history' do
              browsing_context.navigate(context: driver.window_handle, url: url_for('blank.html'), wait: :complete)
              browsing_context.navigate(
                context: driver.window_handle,
                url: url_for('bidi/logEntryAdded.html'),
                wait: :complete
              )

              browsing_context.traverse_history(context: driver.window_handle, delta: -1)
              wait_for_url('blank.html')
              expect(driver.current_url).to include('blank.html')

              browsing_context.traverse_history(context: driver.window_handle, delta: 1)
              wait_for_url('bidi/logEntryAdded.html')
              expect(driver.current_url).to include('bidi/logEntryAdded.html')
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
