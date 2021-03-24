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
        describe '#new' do
          it 'collects guards from example only for known guard types',
             except: {}, only: {}, exclusive: {}, exclude: {}, ignored: {} do |example|
            guards = WebDriver::Support::Guards.new(example)
            types = guards.instance_variable_get(:@guards).map { |g| g.instance_variable_get(:@type) }
            expect(types).to include :except, :only, :exclusive, :exclude
            expect(types).not_to include :ignored
          end

          it 'accepts bug tracker value' do |example|
            guards = WebDriver::Support::Guards.new(example, bug_tracker: 'https://example.com/bugs')
            expect(guards.instance_variable_get(:@bug_tracker)).to eq 'https://example.com/bugs'
          end

          it 'accepts conditions' do |example|
            condition1 = WebDriver::Support::Guards::GuardCondition.new(:foo)
            condition2 = WebDriver::Support::Guards::GuardCondition.new(:bar)

            guards = WebDriver::Support::Guards.new(example, conditions: [condition1, condition2])
            expect(guards.instance_variable_get(:@guard_conditions)).to include condition1, condition2
          end
        end

        describe '#add_conditions' do
          it 'sets multiple' do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_condition :foo, true
            guards.add_condition :bar, false

            expect(guards.instance_variable_get(:@guard_conditions).map(&:name)).to include :foo, :bar
          end
        end

        describe '#add_message' do
          it 'sets multiple custom messages' do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_message(:foo, 'The problem is foo')
            guards.add_message(:bar, 'The problem is bar')

            expect(guards.messages).to include({foo: 'The problem is foo'}, {bar: 'The problem is bar'})
          end
        end

        describe '#disposition' do
          it 'returns nothing' do |example|
            guards = WebDriver::Support::Guards.new(example)
            expect(guards.disposition).to be_nil
          end

          it 'is pending without provided reason', except: {foo: false} do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_condition(:foo, false)

            expect(guards.disposition).to eq [:pending, 'Test guarded; no reason given']
          end

          it 'is skipped without provided reason', exclusive: {foo: true} do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_condition(:foo, false)

            message = 'Test does not apply to this configuration; no reason given'
            expect(guards.disposition).to eq [:skip, message]
          end
        end

        describe '#satisfied?' do
          it 'evaluates guard' do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_condition(:foo, true)
            guards.add_condition(:bar, false)

            guard = Guards::Guard.new({foo: true, bar: false}, :only)

            expect(guards.satisfied?(guard)).to eq true
          end
        end
      end

      describe Guards::GuardCondition do
        describe '#new' do
          it 'accepts condition' do
            condition = Guards::GuardCondition.new(:foo, true)
            expect(condition.name).to eq :foo
            expect(condition.execution).to be_a Proc
            expect(condition.execution.call([true])).to eq true
          end

          it 'accepts block' do
            condition = Guards::GuardCondition.new(:foo) { |guarded| guarded.include?(7) }
            expect(condition.name).to eq :foo
            expect(condition.execution).to be_a Proc
            expect(condition.execution.call([7])).to eq true
          end
        end

        describe '#satisfied' do
          it 'returns true with corresponding guard' do
            condition = Guards::GuardCondition.new(:foo) { |guarded| guarded.include?(7) }
            guard = Guards::Guard.new({foo: 7}, :only)
            expect(condition.satisfied?(guard)).to eq true
          end

          it 'returns false with corresponding guard' do
            condition = Guards::GuardCondition.new(:foo) { |guarded| guarded.include?(7) }
            guard = Guards::Guard.new({foo: 8}, :except)
            expect(condition.satisfied?(guard)).to eq false
          end
        end
      end

      describe Guards::Guard do
        describe '#new' do
          it 'requires guarded Hash and type' do
            guard = Guards::Guard.new({foo: 7}, :only)
            expect(guard.guarded).to eq(foo: 7)
            expect(guard.type).to eq :only
          end

          it 'creates unknown message by default' do
            guard = Guards::Guard.new({foo: 7}, :only)
            expect(guard.messages).to include(unknown: 'TODO: Investigate why this is failing and file a bug report')
          end

          it 'accepts a reason in guarded' do
            guard = Guards::Guard.new({foo: 7, reason: 'because'}, :only)
            expect(guard.reason).to eq 'because'
          end
        end

        describe '#message' do
          it 'defaults to no reason given' do
            guard = Guards::Guard.new({}, :only)

            expect(guard.message).to eq('Test guarded; no reason given')
          end

          it 'accepts integer' do |example|
            guards = WebDriver::Support::Guards.new(example, bug_tracker: 'http://example.com/bugs')
            guard = Guards::Guard.new({reason: 1}, :only, guards)

            expect(guard.message).to eq('Test guarded; Bug Filed: http://example.com/bugs/1')
          end

          it 'accepts String' do
            guard = Guards::Guard.new({reason: 'because'}, :only)

            expect(guard.message).to eq('Test guarded; because')
          end

          it 'accepts Symbol of known message' do
            guard = Guards::Guard.new({reason: :unknown}, :only)

            expect(guard.message).to eq('Test guarded; TODO: Investigate why this is failing and file a bug report')
          end

          it 'accepts Symbol of new message' do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_message(:foo, 'all due to foo')
            guard = Guards::Guard.new({reason: :foo}, :only, guards)

            expect(guard.message).to eq('Test guarded; all due to foo')
          end

          it 'has special message for exclude' do
            guard = Guards::Guard.new({reason: 'because'}, :exclude)

            expect(guard.message).to eq('Test not guarded because it breaks test run; because')
          end

          it 'has special message for exclusive' do
            guard = Guards::Guard.new({reason: 'because'}, :exclusive)

            expect(guard.message).to eq('Test does not apply to this configuration; because')
          end
        end
      end

    end # Support
  end # WebDriver
end # Selenium
