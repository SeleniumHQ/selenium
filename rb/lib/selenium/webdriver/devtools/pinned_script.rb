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
    class DevTools
      class PinnedScript
        attr_accessor :key, :devtools_identifier, :script

        def initialize(script)
          @key = SecureRandom.alphanumeric
          @script = script
        end

        #
        # @api private
        #

        def callable
          "function __webdriver_#{key}(arguments) { #{script} }"
        end

        #
        # @api private
        #

        def to_json(*)
          %{"return __webdriver_#{key}(arguments)"}
        end

        #
        # @api private
        #

        def remove
          "__webdriver_#{key} = undefined"
        end
      end # PinnedScript
    end # DevTools
  end # WebDriver
end # Selenium
