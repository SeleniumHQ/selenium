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
    module Support
      class Guards
        #
        # Guard derived from RSpec example metadata.
        # @api private
        #

        class Guard
          attr_reader :guarded, :type, :messages, :reason, :tracker

          def initialize(guarded, type, guards = nil)
            @guarded = guarded
            @tracker = guards&.bug_tracker || ''
            @messages = guards&.messages || {}
            @messages[:unknown] = 'TODO: Investigate why this is failing and file a bug report'
            @type = type

            @reason = @guarded[:reason] || 'No reason given'
            @guarded[:reason] = @reason
          end

          def message
            details = case reason
                      when Integer
                        "Bug Filed: #{tracker}/#{reason}"
                      when Symbol
                        messages[reason]
                      else
                        "Guarded by #{guarded};"
                      end

            case type
            when :skip_if, :exclude
              "Test skipped because it breaks test run; #{details}"
            when :flaky
              "Test skipped because it is unreliable in this configuration; #{details}"
            when :skip_unless, :exclusive
              "Test does not apply to this configuration; #{details}"
            else
              "Test guarded; #{details}"
            end
          end

          # Test is expected to fail on the configurations specified (marked pending).
          def except?
            @type == :pending_if || @type == :except
          end

          # Test is expected to fail on every configuration except those specified (marked pending).
          def only?
            @type == :pending_unless || @type == :only
          end

          # Test is skipped on the configurations specified because it breaks the run or is unreliable.
          def exclude?
            @type == :skip_if || @type == :exclude || @type == :flaky
          end

          # Test is skipped on every configuration except those specified (it only applies there).
          def exclusive?
            @type == :skip_unless || @type == :exclusive
          end
        end # Guard
      end # Guards
    end # Support
  end # WebDriver
end # Selenium
