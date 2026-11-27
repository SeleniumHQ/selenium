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
    #
    # The session's store for errors raised by user code on BiDi listener threads, which nothing above those
    # threads can handle; each is raised on the thread that drives the browser, at its next command.
    #
    # @api private
    #

    class ListenerErrors
      THREAD_KEY = :selenium_listener_thread

      # Marks the calling thread as one that runs listeners, so the commands it sends leave stored errors alone
      def self.listener_thread!
        Thread.current.thread_variable_set(THREAD_KEY, true)
      end

      def self.listener_thread?
        Thread.current.thread_variable_get(THREAD_KEY) == true
      end

      def initialize
        @mutex = Mutex.new
        @error = nil
      end

      # Keeps only the first error until it is raised, since later ones are often its consequences
      def add(error)
        @mutex.synchronize { @error ||= error }
        nil
      end

      def check
        return if self.class.listener_thread?

        error = @mutex.synchronize { @error.tap { @error = nil } }
        raise error if error
      end
    end # ListenerErrors
  end # WebDriver
end # Selenium
