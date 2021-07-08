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

        def pin_script(script)
          script = DevTools::PinnedScript.new(script)
          pinned_scripts << script

          devtools.page.enable
          devtools.runtime.evaluate(expression: script.callable)
          response = devtools.page.add_script_to_evaluate_on_new_document(source: script.callable)
          script.devtools_identifier = response.dig('result', 'identifier')

          script
        end

        def unpin_script(script)
          devtools.runtime.evaluate(expression: script.remove)
          devtools.page.remove_script_to_evaluate_on_new_document(identifier: script.devtools_identifier)
          pinned_scripts.delete(script)
        end

        def pinned_scripts
          @pinned_scripts ||= []
        end

        def execute_script(script, *args)
          script = script.call if script.is_a?(DevTools::PinnedScript)
          super(script, *args)
        end

        def execute_async_script(script, *args)
          script = script.call if script.is_a?(DevTools::PinnedScript)
          super(script, *args)
        end

      end # HasPinnedScripts
    end # DriverExtensions
  end # WebDriver
end # Selenium
