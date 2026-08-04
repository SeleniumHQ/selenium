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
        describe Script, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:script) { described_class.new(driver) }

          def target(context = driver.window_handle, sandbox: nil)
            kwargs = {context: context}
            kwargs[:sandbox] = sandbox if sandbox
            Script::ContextTarget.new(**kwargs)
          end

          def evaluate(expression, **kwargs)
            script.evaluate(
              expression: expression,
              target: kwargs.fetch(:target, target),
              await_promise: kwargs.fetch(:await_promise, false),
              result_ownership: kwargs.fetch(:result_ownership, WebDriver::BiDi::Serialization::UNSET),
              serialization_options: kwargs.fetch(:serialization_options, WebDriver::BiDi::Serialization::UNSET)
            )
          end

          describe '#add_preload_script',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari driver currently returns an error for BiDi preload scripts'} do
            it 'runs a preload script in future documents' do
              result = script.add_preload_script(
                function_declaration: "() => { window.__ruby_bidi_preload = 'installed'; }"
              )

              driver.navigate.to url_for('blank.html')

              expect(result).to be_a(Script::AddPreloadScriptResult)
              expect(result.script).to be_a(String)
              expect(evaluate('window.__ruby_bidi_preload').result.value).to eq('installed')
            ensure
              script.remove_preload_script(script: result.script) if result&.script
            end

            it 'accepts context and sandbox options' do
              result = script.add_preload_script(
                function_declaration: '() => { globalThis.__ruby_bidi_sandbox_preload = 7; }',
                contexts: [driver.window_handle],
                sandbox: 'ruby-preload'
              )

              driver.navigate.to url_for('blank.html')
              sandbox_result = evaluate(
                'globalThis.__ruby_bidi_sandbox_preload',
                target: target(driver.window_handle, sandbox: 'ruby-preload')
              )

              expect(sandbox_result.result.value).to eq(7)
            ensure
              script.remove_preload_script(script: result.script) if result&.script
            end
          end

          describe '#call_function',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::SerializationError},
                                reason: 'Safari remote value fails deserialization'} do
            it 'calls a function with local value arguments' do
              result = script.call_function(
                function_declaration: '(left, right) => left + right',
                await_promise: false,
                target: target,
                arguments: [Script::NumberValue.new(value: 2), Script::NumberValue.new(value: 3)]
              )

              expect(result).to be_a(Script::EvaluateResultSuccess)
              expect(result.result).to eq(Script::NumberValue.new(value: 5))
            end

            it 'accepts this, ownership, serialization, and user activation options' do
              result = script.call_function(
                function_declaration: 'function (suffix) { return this.prefix + suffix; }',
                await_promise: true,
                target: target,
                arguments: [Script::StringValue.new(value: 'BiDi')],
                result_ownership: :none,
                serialization_options: Script::SerializationOptions.new(max_object_depth: 1),
                this: Script::ObjectLocalValue.new(value: [['prefix', Script::StringValue.new(value: 'Ruby ')]]),
                user_activation: true
              )

              expect(result).to be_a(Script::EvaluateResultSuccess)
              expect(result.result).to eq(Script::StringValue.new(value: 'Ruby BiDi'))
            end
          end

          describe '#disown',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::SerializationError},
                                reason: 'Safari remote value fails deserialization'} do
            it 'disowns a remote handle' do
              result = evaluate('({answer: 42})', result_ownership: :root)
              handle = result.result.handle

              expect(handle).to be_a(String)
              expect(script.disown(handles: [handle], target: target)).to be_empty
            end
          end

          describe '#evaluate',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::SerializationError},
                                reason: 'Safari remote value fails deserialization'} do
            it 'evaluates an expression in the current context' do
              result = evaluate('1 + 2')

              expect(result).to be_a(Script::EvaluateResultSuccess)
              expect(result.result).to eq(Script::NumberValue.new(value: 3))
              expect(result.realm).to be_a(String)
            end

            it 'awaits promises and accepts serialization options' do
              result = evaluate(
                'Promise.resolve({name: "ruby", nested: {hidden: true}})',
                await_promise: true,
                result_ownership: :root,
                serialization_options: Script::SerializationOptions.new(max_object_depth: 1)
              )

              expect(result).to be_a(Script::EvaluateResultSuccess)
              expect(result.result).to be_a(Script::ObjectRemoteValue)
              expect(result.result.handle).to be_a(String)
            ensure
              if result&.result.respond_to?(:handle) && result.result.handle.is_a?(String)
                script.disown(handles: [result.result.handle], target: target)
              end
            end
          end

          describe '#get_realms' do
            it 'returns window realms' do
              result = script.get_realms

              expect(result.realms).not_to be_empty
              expect(result.realms).to all(respond_to(:realm))
            end

            it 'filters realms by context and type' do
              result = script.get_realms(context: driver.window_handle, type: :window)

              expect(result.realms).not_to be_empty
              expect(result.realms.map(&:context)).to all(eq(driver.window_handle))
              expect(result.realms.map { |realm| realm.type.to_s }.uniq).to eq(['window'])
            end
          end

          describe '#remove_preload_script',
                   pending_if: {browser_family: :safari,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Safari driver currently returns an error for BiDi preload scripts'} do
            it 'removes a preload script before future navigations' do
              result = script.add_preload_script(
                function_declaration: '() => { window.__ruby_bidi_removed_preload = true; }'
              )

              script.remove_preload_script(script: result.script)
              driver.navigate.to url_for('blank.html')

              expect(evaluate('typeof window.__ruby_bidi_removed_preload').result.value).to eq('undefined')
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
