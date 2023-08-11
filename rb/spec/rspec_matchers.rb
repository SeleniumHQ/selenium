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

LEVELS = %w[warning info deprecated].freeze

LEVELS.each do |level|
  RSpec::Matchers.define "have_#{level}" do |entry|
    match do |actual|
      # Suppresses logging output to stdout while ensuring that it is still happening
      default_output = Selenium::WebDriver.logger.io
      io = StringIO.new
      Selenium::WebDriver.logger.output = io

      begin
        actual.call
      rescue StandardError => e
        raise e, 'Can not evaluate output when statement raises an exception'
      ensure
        Selenium::WebDriver.logger.output = default_output
      end

      @entries_found = (io.rewind && io.read).scan(/\[:([^\]]*)\]/).flatten.map(&:to_sym)
      expect(Array(entry).sort).to eq(@entries_found.sort)
    end

    failure_message do
      but_message = if @entries_found.nil? || @entries_found.empty?
                      "no #{entry} entries were reported"
                    else
                      "instead these entries were found: [#{@entries_found.join(', ')}]"
                    end
      "expected :#{entry} to have been logged, but #{but_message}"
    end

    failure_message_when_negated do
      but_message = "it was found among these entries: [#{@entries_found.join(', ')}]"
      "expected :#{entry} not to have been logged, but #{but_message}"
    end

    def supports_block_expectations?
      true
    end
  end
end
