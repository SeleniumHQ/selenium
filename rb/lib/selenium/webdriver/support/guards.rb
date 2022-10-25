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

require_relative 'guards/guard_condition'
require_relative 'guards/guard'

module Selenium
  module WebDriver
    module Support
      class Guards
        GUARD_TYPES = %i[except only exclude exclusive].freeze

        attr_reader :messages
        attr_accessor :bug_tracker

        def initialize(example, bug_tracker: '', conditions: nil)
          @example = example
          @bug_tracker = bug_tracker
          @guard_conditions = conditions || []
          @guards = collect_example_guards
          @messages = {}
        end

        def add_condition(name, condition = nil, &blk)
          @guard_conditions << GuardCondition.new(name, condition, &blk)
        end

        def add_message(name, message)
          @messages[name] = message
        end

        def disposition
          if !skipping_guard.nil?
            [:skip, skipping_guard.message]
          elsif !pending_guard.nil? && ENV.fetch('SKIP_PENDING', nil)
            [:skip, pending_guard.message]
          elsif !pending_guard.nil?
            [:pending, pending_guard.message]
          end
        end

        def satisfied?(guard)
          @guard_conditions.all? { |condition| condition.satisfied?(guard) }
        end

        private

        def collect_example_guards
          guards = []

          GUARD_TYPES.each do |guard_type|
            example_group = @example.metadata[:example_group]
            example_guards = [@example.metadata[guard_type], example_group[guard_type]]
            while example_group[:parent_example_group]
              example_group = example_group[:parent_example_group]
              example_guards << example_group[guard_type]
            end

            example_guards.flatten.uniq.compact.each do |example_guard|
              guards << Guard.new(example_guard, guard_type, self)
            end
          end

          guards
        end

        def skipping_guard
          @guards.select(&:exclusive?).find { |guard| !satisfied?(guard) } ||
            @guards.select(&:exclude?).find { |guard| satisfied?(guard) }
        end

        def pending_guard
          @guards.select(&:except?).find { |guard| satisfied?(guard) } ||
            @guards.select(&:only?).find { |guard| !satisfied?(guard) }
        end
      end # Guards
    end # Support
  end # WebDriver
end # Selenium
