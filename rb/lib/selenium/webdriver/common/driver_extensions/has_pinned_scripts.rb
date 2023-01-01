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
    module DriverExtensions
      module HasPinnedScripts
        #
        # Returns the list of all pinned scripts.
        #
        # @return [Array<DevTools::PinnedScript>]
        #

        def pinned_scripts
          @pinned_scripts ||= []
        end

        #
        # Pins JavaScript snippet that is available during the whole
        # session on every page. This allows to store and call
        # scripts without sending them over the wire every time.
        #
        # @example
        #   script = driver.pin_script('return window.location.href')
        #   driver.execute_script(script)
        #   # navigate to a new page
        #   driver.execute_script(script)
        #
        # @param [String] script
        # @return [DevTools::PinnedScript]
        #

        def pin_script(script)
          script = DevTools::PinnedScript.new(script)
          pinned_scripts << script

          devtools.page.enable
          devtools.runtime.evaluate(expression: script.callable)
          response = devtools.page.add_script_to_evaluate_on_new_document(source: script.callable)
          script.devtools_identifier = response.dig('result', 'identifier')

          script
        end

        #
        # Unpins script making it undefined for the subsequent calls.
        #
        # @param [DevTools::PinnedScript] script
        #

        def unpin_script(script)
          devtools.runtime.evaluate(expression: script.remove)
          devtools.page.remove_script_to_evaluate_on_new_document(identifier: script.devtools_identifier)
          pinned_scripts.delete(script)
        end
      end # HasPinnedScripts
    end # DriverExtensions
  end # WebDriver
end # Selenium
