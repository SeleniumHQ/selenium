# encoding: utf-8
#
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
    class Timeouts
      def initialize(bridge)
        @bridge = bridge
      end

      #
      # Set the amount of time the driver should wait when searching for elements.
      #

      def implicit_wait=(seconds)
        @bridge.implicit_wait_timeout = Integer(seconds * 1000)
      end

      #
      # Sets the amount of time to wait for an asynchronous script to finish
      # execution before throwing an error. If the timeout is negative, then the
      # script will be allowed to run indefinitely.
      #

      def script_timeout=(seconds)
        @bridge.script_timeout = Integer(seconds * 1000)
      end

      #
      # Sets the amount of time to wait for a page load to complete before throwing an error.
      # If the timeout is negative, page loads can be indefinite.
      #

      def page_load=(seconds)
        @bridge.timeout 'page load', Integer(seconds * 1000)
      end
    end # Timeouts
  end # WebDriver
end # Selenium
