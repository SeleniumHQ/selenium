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

require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      # The window of each browsing context a session has announced, so a context an event names can be traced
      # to its window. Destroyed contexts are kept: an event can arrive after its context is gone, and ids are
      # never reused.
      #
      # @api private
      class ContextTree
        # Listens and subscribes before reading the tree, so no context created meanwhile is missed.
        def initialize(connection)
          @windows = {}
          # Listener threads write concurrently, and Hash is not thread-safe on JRuby or TruffleRuby
          @mutex = Mutex.new
          contexts = Protocol::BrowsingContext.new(connection)
          contexts.add_context_created_listener { |info| created(info) }
          Protocol::Session.new(connection).subscribe(events: [Protocol::BrowsingContext::EVENTS[:context_created]])
          contexts.get_tree.contexts.each { |info| record(info, info.context) }
        rescue Error::WebDriverError => e
          @untracked = e.message
          WebDriver.logger.warn("Browsing contexts are not tracked: #{e.message}", id: :bidi_context_tree)
        end

        # Listeners run on threads of their own, so an event can be handled before the creation of its context.
        #
        # @return [String] the window the context is in, itself for a window
        # @raise [Error::TimeoutError] when the context is not announced within 2 seconds
        def top_level(context)
          raise Error::WebDriverError, "Browsing contexts are not tracked: #{@untracked}" if @untracked

          wait = Wait.new(timeout: 2, interval: 0.01, message: "no browsing context #{context} was announced")
          wait.until { @mutex.synchronize { @windows[context] } }
        end

        private

        def created(info)
          parent = info.parent
          window = parent.nil? || Serialization::UNSET.equal?(parent) ? info.context : top_level(parent)
          record(info, window)
        end

        def record(info, window)
          @mutex.synchronize { @windows[info.context] = window }
          children = info.children
          return if children.nil? || Serialization::UNSET.equal?(children)

          children.each { |child| record(child, window) }
        end
      end # ContextTree
    end # BiDi
  end # WebDriver
end # Selenium
