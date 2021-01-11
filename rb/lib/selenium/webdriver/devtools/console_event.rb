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
      class ConsoleEvent

        attr_accessor :type, :timestamp, :args

        def initialize(type:, timestamp:, args:)
          @type = type.to_sym
          @timestamp = Time.at(timestamp / 1000)
          @args = args.map do |arg|
            arg.key?('value') ? arg['value'] : arg
          end
        end

      end # ConsoleEvent
    end # DevTools
  end # WebDriver
end # Selenium
