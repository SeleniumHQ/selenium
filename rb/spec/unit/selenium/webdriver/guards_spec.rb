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
require 'selenium/webdriver/support/guards'

module Selenium
  module WebDriver
    module Support
      describe Guards do
        before do |example|
          guards = described_class.new(example, bug_tracker: 'https://github.com/SeleniumHQ/selenium/issues')
          guards.add_condition(:condition, :guarded)

          results = guards.disposition
          send(*results) if results
        end

        context 'with single guard' do
          describe '#skip_if' do
            it 'ignores an unrecognized guard parameter', invalid: {condition: :guarded} do
              # pass
            end

            it 'skips without running', skip_if: {condition: :guarded} do
              raise 'This code will not get executed so it will not fail'
            end
          end

          describe '#flaky' do
            it 'skips without running', flaky: {condition: :guarded} do
              raise 'This code will not get executed so it will not fail'
            end
          end

          describe '#skip_unless' do
            it 'skips without running if it does not match', skip_unless: {condition: :not_guarded} do
              raise 'This code will not get executed so it will not fail'
            end

            it 'does not guard if it does match', skip_unless: {condition: :guarded} do
              # pass
            end
          end

          describe '#pending_unless' do
            it 'guards when value does not match', pending_unless: {condition: :not_guarded} do
              raise 'This code is executed but expected to fail'
            end

            it 'does not guard when value matches', pending_unless: {condition: :guarded} do
              # pass
            end
          end

          describe '#pending_if' do
            it 'guards when value matches and test fails', pending_if: {condition: :guarded} do
              raise 'This code is executed but expected to fail'
            end

            it 'does not guard when value does not match and test passes', pending_if: {condition: :not_guarded} do
              # pass
            end
          end
        end

        context 'with multiple guards' do
          it 'guards if neither pending_unless nor pending_if match and test fails',
             pending_if: {condition: :not_guarded},
             pending_unless: {condition: :not_guarded} do
            raise 'This code is executed but expected to fail'
          end

          it 'guards if both pending_unless and pending_if match', pending_if: {condition: :guarded},
                                                                   pending_unless: {condition: :guarded} do
            raise 'This code is executed but expected to fail'
          end

          it 'guards if pending_if matches and pending_unless does not', pending_if: {condition: :guarded},
                                                                         pending_unless: {condition: :not_guarded} do
            raise 'This code is executed but expected to fail'
          end

          it 'does not guard if pending_unless matches and pending_if does not',
             pending_if: {condition: :not_guarded},
             pending_unless: {condition: :guarded} do
            # pass
          end

          it 'gives correct reason', pending_if: [{condition: :guarded, reason: 'bug1'},
                                                  {condition: :not_guarded, reason: 'bug2'}] do
            raise 'This code is executed but expected to fail'
          end
        end

        context 'with array of hashes' do
          it 'guards if any Hash value is satisfied',
             pending_unless: [{condition: :guarded}, {condition: :not_guarded}] do
            raise 'This code is executed but expected to fail'
          end
        end

        context 'with backwards-compatible aliases' do
          it 'skips with #exclude', exclude: {condition: :guarded} do
            raise 'This code will not get executed so it will not fail'
          end

          it 'skips with #exclusive when it does not match', exclusive: {condition: :not_guarded} do
            raise 'This code will not get executed so it will not fail'
          end

          it 'is pending with #only when value does not match', only: {condition: :not_guarded} do
            raise 'This code is executed but expected to fail'
          end

          it 'is pending with #except when value matches', except: {condition: :guarded} do
            raise 'This code is executed but expected to fail'
          end
        end

        context 'with guards on enclosing groups' do
          describe 'guard on the describe block', skip_if: {condition: :guarded} do
            it 'applies to an example without its own guard' do
              raise 'This code will not get executed so it will not fail'
            end
          end

          context 'with a guard on the context block', skip_unless: {condition: :not_guarded} do
            it 'applies to an example without its own guard' do
              raise 'This code will not get executed so it will not fail'
            end
          end

          describe 'guard on an outer group', pending_if: {condition: :guarded} do
            context 'with a nested inner group' do
              it 'still inherits the outer guard' do
                raise 'This code is executed but expected to fail'
              end
            end
          end
        end
      end
    end # Support
  end # WebDriver
end # Selenium
