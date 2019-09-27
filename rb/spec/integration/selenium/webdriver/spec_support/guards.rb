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

module Selenium
  module WebDriver
    module SpecSupport
      class Guards
        include Enumerable

        GUARD_TYPES = %i[except only exclude].freeze

        def initialize(example, guards = nil)
          @example = example
          @guards = guards || collect_example_guards
        end

        def each(&block)
          @guards.each(&block)
        end

        def except
          self.class.new(@example, @guards.select(&:except?))
        end

        def only
          self.class.new(@example, @guards.select(&:only?))
        end

        def exclude
          self.class.new(@example, @guards.select(&:exclude?)).satisfied
        end

        def satisfied
          self.class.new(@example, @guards.select(&:satisfied?))
        end

        def unsatisfied
          self.class.new(@example, @guards.reject(&:satisfied?))
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
              guards << Guard.new(example_guard, guard_type)
            end
          end

          guards
        end
      end # Guards
    end # SpecSupport
  end # WebDriver
end # Selenium
