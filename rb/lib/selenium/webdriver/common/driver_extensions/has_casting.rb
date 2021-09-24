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
      module HasCasting

        def cast_sinks
          @bridge.cast_sinks
        end

        def cast_sink_to_use=(name)
          @bridge.cast_sink_to_use = name
        end

        def start_cast_tab_mirroring(name)
          @bridge.start_cast_tab_mirroring(name)
        end

        def cast_issue_message
          @bridge.cast_issue_message
        end

        def stop_casting(name)
          @bridge.stop_casting(name)
        end
      end # HasCasting
    end # DriverExtensions
  end # WebDriver
end # Selenium
