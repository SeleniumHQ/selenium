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
        describe Emulation,
                 pending_if: {browser_family: :safari,
                              exception: {class: Error::UnknownCommandError},
                              reason: 'Safari driver currently returns unknown command for BiDi emulation commands'},
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:emulation) { described_class.new(driver) }
          let(:script) { Script.new(driver) }
          let(:browsing_context) { BrowsingContext.new(driver) }

          def target(context)
            Script::ContextTarget.new(context: context)
          end

          def evaluate_value(expression, context = driver.window_handle)
            result = script.evaluate(expression: expression, target: target(context), await_promise: false).result
            result.respond_to?(:value) ? result.value : nil
          end

          def create_context
            browsing_context.create(type: :tab).context
          end

          describe '#set_forced_colors_mode_theme_override',
                   pending_if: [{browser_family: :chromium,
                                 exception: {class: Error::UnsupportedOperationError,
                                             message: /emulation\.setForcedColorsModeThemeOverride/},
                                 reason: 'Chromium unsupported operation: emulation.setForcedColorsModeThemeOverride'},
                                {browser: :firefox,
                                 exception: {class: Error::UnknownCommandError},
                                 reason: 'Firefox unknown command: emulation.setForcedColorsModeThemeOverride'}] do
            it 'sets and clears forced-colors theme override' do
              expect(emulation.set_forced_colors_mode_theme_override(
                       theme: :dark,
                       contexts: [driver.window_handle]
                     )).to be_empty
              expect(emulation.set_forced_colors_mode_theme_override(
                       theme: nil,
                       contexts: [driver.window_handle]
                     )).to be_empty
            end
          end

          describe '#set_geolocation_override' do
            it 'sets and clears geolocation coordinates' do
              coordinates = Emulation::GeolocationCoordinates.new(latitude: 37, longitude: -122, accuracy: 10)

              expect(emulation.set_geolocation_override(
                       coordinates: coordinates,
                       contexts: [driver.window_handle]
                     )).to be_empty
              expect(emulation.set_geolocation_override(
                       coordinates: nil,
                       contexts: [driver.window_handle]
                     )).to be_empty
            end

            it 'sets a geolocation error override',
               pending_if: {browser: :firefox,
                            exception: {class: Error::InvalidArgumentError,
                                        message: /coordinates/},
                            reason: 'Firefox does not support the geolocation error override'} do
              expect(emulation.set_geolocation_override(
                       error: Emulation::GeolocationPositionError.new,
                       contexts: [driver.window_handle]
                     )).to be_empty
            ensure
              begin
                emulation.set_geolocation_override(coordinates: nil, contexts: [driver.window_handle])
              rescue StandardError
                nil
              end
            end
          end

          describe '#set_locale_override' do
            it 'overrides locale for a fresh context' do
              context = create_context

              emulation.set_locale_override(locale: 'fr-FR', contexts: [context])
              browsing_context.navigate(context: context, url: url_for('blank.html'), wait: :complete)

              expect(evaluate_value('Intl.DateTimeFormat().resolvedOptions().locale', context)).to start_with('fr')
            ensure
              emulation.set_locale_override(locale: nil, contexts: [context]) if context
              browsing_context.close(context: context) if context
            end
          end

          describe '#set_network_conditions' do
            it 'sets and clears offline network conditions' do
              expect(emulation.set_network_conditions(
                       network_conditions: Emulation::NetworkConditionsOffline.new,
                       contexts: [driver.window_handle]
                     )).to be_empty
              expect(emulation.set_network_conditions(
                       network_conditions: nil,
                       contexts: [driver.window_handle]
                     )).to be_empty
            end
          end

          describe '#set_screen_orientation_override' do
            it 'sets and clears screen orientation' do
              orientation = Emulation::ScreenOrientation.new(natural: :portrait, type: :portrait_primary)

              expect(emulation.set_screen_orientation_override(
                       screen_orientation: orientation,
                       contexts: [driver.window_handle]
                     )).to be_empty
              expect(emulation.set_screen_orientation_override(
                       screen_orientation: nil,
                       contexts: [driver.window_handle]
                     )).to be_empty
            end
          end

          describe '#set_screen_settings_override' do
            it 'sets and clears screen area' do
              expect(emulation.set_screen_settings_override(
                       screen_area: Emulation::ScreenArea.new(width: 800, height: 600),
                       contexts: [driver.window_handle]
                     )).to be_empty
              expect(emulation.set_screen_settings_override(
                       screen_area: nil,
                       contexts: [driver.window_handle]
                     )).to be_empty
            end
          end

          describe '#set_scripting_enabled',
                   pending_if: {browser: :firefox,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Firefox returns unknown command for emulation.setScriptingEnabled'} do
            it 'disables and restores page scripting' do
              context = driver.window_handle

              emulation.set_scripting_enabled(enabled: false, contexts: [context])
              browsing_context.navigate(
                context: context,
                url: "data:text/html,<script>window.hello='World';</script>",
                wait: :complete
              )
              expect(evaluate_value('window.hello', context)).to be_nil

              emulation.set_scripting_enabled(enabled: nil, contexts: [context])
              browsing_context.navigate(
                context: context,
                url: "data:text/html,<script>window.hello='World';</script>",
                wait: :complete
              )
              expect(evaluate_value('window.hello', context)).to eq('World')
            ensure
              begin
                emulation.set_scripting_enabled(enabled: nil, contexts: [driver.window_handle])
              rescue StandardError
                nil
              end
            end
          end

          describe '#set_scrollbar_type_override',
                   pending_if: {browser: :firefox,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Firefox returns unknown command for emulation.setScrollbarTypeOverride'} do
            it 'sets and clears scrollbar type override' do
              expect(emulation.set_scrollbar_type_override(
                       scrollbar_type: :classic,
                       contexts: [driver.window_handle]
                     )).to be_empty
              expect(emulation.set_scrollbar_type_override(
                       scrollbar_type: nil,
                       contexts: [driver.window_handle]
                     )).to be_empty
            end
          end

          describe '#set_timezone_override' do
            it 'overrides timezone for a fresh context' do
              context = create_context

              emulation.set_timezone_override(timezone: 'UTC', contexts: [context])
              browsing_context.navigate(context: context, url: url_for('blank.html'), wait: :complete)

              expect(evaluate_value('Intl.DateTimeFormat().resolvedOptions().timeZone', context)).to eq('UTC')
            ensure
              emulation.set_timezone_override(timezone: nil, contexts: [context]) if context
              browsing_context.close(context: context) if context
            end
          end

          describe '#set_touch_override',
                   pending_if: {browser: :firefox,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Firefox returns unknown command for emulation.setTouchOverride'} do
            it 'sets and clears touch support' do
              context = driver.window_handle

              emulation.set_touch_override(max_touch_points: 5, contexts: [context])
              expect(evaluate_value('navigator.maxTouchPoints', context)).to eq(5)

              expect(emulation.set_touch_override(max_touch_points: nil, contexts: [context])).to be_empty
            end
          end

          describe '#set_user_agent_override' do
            it 'overrides and clears the user agent' do
              context = driver.window_handle
              custom_user_agent = 'Ruby BiDi UA/1.0'

              emulation.set_user_agent_override(user_agent: custom_user_agent, contexts: [context])
              browsing_context.navigate(context: context, url: url_for('blank.html'), wait: :complete)
              expect(evaluate_value('navigator.userAgent', context)).to eq(custom_user_agent)

              emulation.set_user_agent_override(user_agent: nil, contexts: [context])
              browsing_context.navigate(context: context, url: url_for('blank.html'), wait: :complete)
              expect(evaluate_value('navigator.userAgent', context)).not_to eq(custom_user_agent)
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
