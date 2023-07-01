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
  class Logger
    LEVELS = {error: 'ERROR',
              warning: 'WARN',
              deprecated: 'WARN',
              info: 'INFO',
              debugged: 'DEBUG'}.freeze

    LEVELS.each_key do |level|
      RSpec::Matchers.define :"have_#{level}" do |expected_ids, logger|
        expected_ids = Array(expected_ids)

        match do |actual|
          # Suppresses logging output to stdout while ensuring that it is still happening
          default_output = logger.io
          io = StringIO.new
          logger.output = io

          begin
            actual.call
          rescue StandardError => e
            raise e, 'Can not evaluate output when statement raises an exception'
          ensure
            logger.output = default_output
          end

          read = io.rewind && io.read

          # Put log type, id, and deprecation tag in entry array
          entries_found = read.scan(/([^ ]*) #{logger.progname} (\[:[^\]]*\])( \[.*\])?/)
          levels_filtered = entries_found.select { |entry| entry.first == LEVELS[level] }
          entries_filtered = levels_filtered.select { |entry| (level == :deprecated) == !entry.last.nil? }

          @found_ids = entries_filtered.map { |val| val[1][/\[:(.*)\]/, 1].to_sym }
          expect(expected_ids - @found_ids).to be_empty
        end

        failure_message do
          but_message = if @found_ids.nil? || @found_ids.empty?
                          "not all #{Array(expected_ids)} entries were reported"
                        else
                          "instead these entries were found: #{Array(@found_ids.join(', '))}"
                        end
          "expected #{expected_ids} to have been logged, but #{but_message}"
        end

        failure_message_when_negated do
          but_message = "it was found among these entries: #{Array(@found_ids.join(', '))}"
          "expected :#{expected_ids} not to have been logged, but #{but_message}"
        end

        def supports_block_expectations?
          true
        end
      end
    end
  end # Logger
end # Selenium
