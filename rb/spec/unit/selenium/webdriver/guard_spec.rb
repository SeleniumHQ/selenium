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
             except: {}, exclude: {}, exclusive: {}, flaky: {}, ignored: {}, only: {},
             pending_if: {}, pending_unless: {}, skip_if: {}, skip_unless: {} do |example|
            guards = described_class.new(example)
            types = guards.instance_variable_get(:@guards).map { |g| g.instance_variable_get(:@type) }
            expect(types).to include :pending_if, :pending_unless, :skip_if, :skip_unless, :flaky,
                                     :except, :only, :exclude, :exclusive
            expect(types).not_to include :ignored
          end

          it 'accepts bug tracker value' do |example|
            guards = described_class.new(example, bug_tracker: 'https://example.com/bugs')
            expect(guards.instance_variable_get(:@bug_tracker)).to eq 'https://example.com/bugs'
          end

          it 'accepts conditions' do |example|
            condition1 = WebDriver::Support::Guards::GuardCondition.new(:foo)
            condition2 = WebDriver::Support::Guards::GuardCondition.new(:bar)

            guards = described_class.new(example, conditions: [condition1, condition2])
            expect(guards.instance_variable_get(:@guard_conditions)).to include condition1, condition2
          end
        end

        describe '#add_conditions' do
          it 'sets multiple' do |example|
            guards = described_class.new(example)
            guards.add_condition :foo, true
            guards.add_condition :bar, false

            expect(guards.instance_variable_get(:@guard_conditions).map(&:name)).to include :foo, :bar
          end
        end

        describe '#add_message' do
          it 'sets multiple custom messages' do |example|
            guards = described_class.new(example)
            guards.add_message(:foo, 'The problem is foo')
            guards.add_message(:bar, 'The problem is bar')

            expect(guards.messages).to include({foo: 'The problem is foo'}, {bar: 'The problem is bar'})
          end
        end

        describe '#disposition' do
          it 'returns nothing' do |example|
            guards = described_class.new(example)
            expect(guards.disposition).to be_nil
          end

          it 'is pending without provided reason', except: {foo: false} do |example|
            guards = described_class.new(example)
            guards.add_condition(:foo, false)

            expect(guards.disposition.size).to eq(2)
            expect(guards.disposition[0]).to eq(ENV.fetch('SKIP_PENDING', nil) ? :skip : :pending)
            guarded_by = /except {:?foo[:=][ >]false, :?reason[:=][ >]"No reason given"};/
            expect(guards.disposition[1]).to match(/Test guarded; #{guarded_by}/)
          end

          it 'is skipped without provided reason', exclusive: {foo: true} do |example|
            guards = described_class.new(example)
            guards.add_condition(:foo, false)

            expect(guards.disposition.size).to eq(2)
            expect(guards.disposition[0]).to eq :skip
            message = /Test does not apply to this configuration;/
            guarded_by = /exclusive {:?foo[:=][ >]true, :?reason[:=][ >]"No reason given"};/
            expect(guards.disposition[1]).to match(/#{message} #{guarded_by}/)
          end
        end

        describe '#pending_exception_guard' do
          it 'returns the active guard carrying an exception clause',
             except: {foo: false, exception: {class: RuntimeError}} do |example|
            guards = described_class.new(example)
            guards.add_condition(:foo, false)

            expect(guards.pending_exception_guard).to be_a(Guards::Guard)
          end

          it 'returns nil when the active pending guard has no exception clause',
             except: {foo: false} do |example|
            guards = described_class.new(example)
            guards.add_condition(:foo, false)

            expect(guards.pending_exception_guard).to be_nil
          end

          it 'returns nil when no pending guard is active' do |example|
            guards = described_class.new(example)

            expect(guards.pending_exception_guard).to be_nil
          end

          it 'returns nil when SKIP_PENDING skips the guard',
             except: {foo: false, exception: {class: RuntimeError}} do |example|
            guards = described_class.new(example)
            guards.add_condition(:foo, false)

            original = ENV.fetch('SKIP_PENDING', nil)
            ENV['SKIP_PENDING'] = 'true'
            expect(guards.pending_exception_guard).to be_nil
          ensure
            original.nil? ? ENV.delete('SKIP_PENDING') : ENV['SKIP_PENDING'] = original
          end
        end

        describe '#satisfied?' do
          it 'evaluates guard' do |example|
            guards = described_class.new(example)
            guards.add_condition(:foo, true)
            guards.add_condition(:bar, false)

            guard = Guards::Guard.new({foo: true, bar: false}, :only)

            expect(guards.satisfied?(guard)).to be true
          end
        end
      end

      describe Guards::GuardCondition do
        describe '#new' do
          it 'accepts condition' do
            condition = described_class.new(:foo, true)
            expect(condition.name).to eq :foo
            expect(condition.execution).to be_a Proc
            expect(condition.execution.call([true])).to be true
          end

          it 'accepts block' do
            condition = described_class.new(:foo) { |guarded| guarded.include?(7) }
            expect(condition.name).to eq :foo
            expect(condition.execution).to be_a Proc
            expect(condition.execution.call([7])).to be true
          end
        end

        describe '#satisfied' do
          it 'returns true with corresponding guard' do
            condition = described_class.new(:foo) { |guarded| guarded.include?(7) }
            guard = Guards::Guard.new({foo: 7}, :only)
            expect(condition.satisfied?(guard)).to be true
          end

          it 'returns false with corresponding guard' do
            condition = described_class.new(:foo) { |guarded| guarded.include?(7) }
            guard = Guards::Guard.new({foo: 8}, :except)
            expect(condition.satisfied?(guard)).to be false
          end
        end
      end

      describe Guards::Guard do
        describe '#new' do
          it 'requires guarded Hash and type' do
            guard = described_class.new({foo: 7}, :only)
            expect(guard.guarded).to eq(foo: 7, reason: 'No reason given')
            expect(guard.type).to eq :only
          end

          it 'does not mutate the given guarded Hash' do
            original = {foo: 7}.freeze
            guard = described_class.new(original, :only)

            expect(guard.guarded).to eq(foo: 7, reason: 'No reason given')
            expect(original).to eq(foo: 7)
          end

          it 'creates unknown message by default' do
            guard = described_class.new({foo: 7}, :only)
            expect(guard.messages).to include(unknown: 'TODO: Investigate why this is failing and file a bug report')
          end

          it 'accepts a reason in guarded' do
            guard = described_class.new({foo: 7, reason: 'because'}, :only)
            expect(guard.reason).to eq 'because'
          end
        end

        describe '#message' do
          it 'defaults to no reason given' do
            guard = described_class.new({}, :only)

            expect(guard.message).to match(/Test guarded; only {:?reason[:=][ >]"No reason given"};/)
          end

          it 'accepts integer' do |example|
            guards = WebDriver::Support::Guards.new(example, bug_tracker: 'http://example.com/bugs')
            guard = described_class.new({reason: 1}, :only, guards)

            expect(guard.message).to eq('Test guarded; Bug Filed: http://example.com/bugs/1')
          end

          it 'accepts String' do
            guard = described_class.new({reason: 'because'}, :only)

            expect(guard.message).to match(/Test guarded; only {:?reason[:=][ >]"because"};/)
          end

          it 'accepts Symbol of known message' do
            guard = described_class.new({reason: :unknown}, :only)

            expect(guard.message).to eq('Test guarded; TODO: Investigate why this is failing and file a bug report')
          end

          it 'accepts Symbol of new message' do |example|
            guards = WebDriver::Support::Guards.new(example)
            guards.add_message(:foo, 'all due to foo')
            guard = described_class.new({reason: :foo}, :only, guards)

            expect(guard.message).to eq('Test guarded; all due to foo')
          end

          it 'has special message for skip_if' do
            guard = described_class.new({reason: 'because'}, :skip_if)

            message = /Test skipped because it breaks test run;/
            expect(guard.message).to match(/#{message} skip if {:?reason[:=][ >]"because"};/)
          end

          it 'has a generic message for pending_if' do
            guard = described_class.new({reason: 'because'}, :pending_if)

            expect(guard.message).to match(/Test guarded; pending if {:?reason[:=][ >]"because"};/)
          end

          it 'has special message for flaky' do
            guard = described_class.new({reason: 'because'}, :flaky)

            message = /Test skipped because it is unreliable in this configuration;/
            expect(guard.message).to match(/#{message} flaky {:?reason[:=][ >]"because"};/)
          end
        end

        describe '#exception?' do
          it 'is true for a pending guard with an exception clause' do
            guard = described_class.new({condition: :guarded, exception: {class: RuntimeError}}, :pending_if)
            expect(guard).to be_exception
          end

          it 'is false for a pending guard without an exception clause' do
            guard = described_class.new({condition: :guarded}, :pending_if)
            expect(guard).not_to be_exception
          end

          it 'is false for a non-pending guard type' do
            guard = described_class.new({condition: :guarded, exception: {class: RuntimeError}}, :skip_if)
            expect(guard).not_to be_exception
          end
        end

        describe '#matches_exception?' do
          context 'with a class only' do
            it 'matches an instance of that class' do
              guard = described_class.new({exception: {class: ArgumentError}}, :pending_if)
              expect(guard.matches_exception?(ArgumentError.new('boom'))).to be true
            end

            it 'does not match a different class' do
              guard = described_class.new({exception: {class: ArgumentError}}, :pending_if)
              expect(guard.matches_exception?(RuntimeError.new('boom'))).to be false
            end
          end

          context 'with a Regexp message' do
            let(:guard) { described_class.new({exception: {class: RuntimeError, message: /unknown/}}, :pending_if) }

            it 'matches the pattern anywhere in the message' do
              expect(guard.matches_exception?(RuntimeError.new('got: unknown command'))).to be true
            end

            it 'does not match when the pattern is absent' do
              expect(guard.matches_exception?(RuntimeError.new('invalid argument'))).to be false
            end
          end

          context 'with a String message' do
            let(:guard) { described_class.new({exception: {class: RuntimeError, message: 'unknown'}}, :pending_if) }

            it 'matches the exact message' do
              expect(guard.matches_exception?(RuntimeError.new('unknown'))).to be true
            end

            it 'does not match a substring' do
              expect(guard.matches_exception?(RuntimeError.new('unknown command'))).to be false
            end
          end

          it 'does not match without an exception clause' do
            guard = described_class.new({condition: :guarded}, :pending_if)
            expect(guard.matches_exception?(RuntimeError.new('boom'))).to be false
          end

          it 'does not match a nil exception' do
            guard = described_class.new({exception: {class: RuntimeError}}, :pending_if)
            expect(guard.matches_exception?(nil)).to be false
          end
        end
      end
    end # Support
  end # WebDriver
end # Selenium
