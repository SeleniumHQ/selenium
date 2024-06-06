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

require_relative 'navigate_result'
require_relative 'browsing_context_info'

module Selenium
  module WebDriver
    class BiDi
      class ContextManager
        READINESS_STATE = {
          'none' => 'none',
          'eager' => 'interactive',
          'normal' => 'complete'
        }.freeze

        def initialize(bridge)
          @bridge = bridge
          @bidi = @bridge.bidi
          page_load_strategy = bridge.capabilities[:page_load_strategy]
          @readiness = READINESS_STATE[page_load_strategy]
        end

        def navigate(url, context_id: nil)
          context_id ||= @bridge.window_handle
          puts "READINESS - #{@readiness}"
          @bidi.send_cmd('browsingContext.navigate', context: context_id, url: url, wait: @readiness)
        end

        # Positive values go forwards, negative values go backwards
        def traverse_history(delta, context_id: nil)
          context_id ||= @bridge.window_handle
          @bidi.send_cmd('browsingContext.traverseHistory', context: context_id, delta: delta)
        end

        def reload(context_id: nil, ignore_cache: false)
          context_id ||= @bridge.window_handle
          params = {context: context_id, ignore_cache: ignore_cache, wait: @readiness}
          @bidi.send_cmd('browsingContext.reload', **params)
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
