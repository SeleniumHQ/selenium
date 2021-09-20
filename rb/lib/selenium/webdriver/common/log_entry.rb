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
    class LogEntry
      attr_reader :level, :timestamp, :message

      def initialize(level, timestamp, message)
        @level = level
        @timestamp = timestamp
        @message = message
      end

      def as_json(*)
        {
          'timestamp' => timestamp,
          'level' => level,
          'message' => message
        }
      end

      def to_s
        "#{time} #{level}: #{message}"
      end

      def time
        Time.at timestamp / 1000
      end
    end # LogEntry
  end # WebDriver
end # Selenium
