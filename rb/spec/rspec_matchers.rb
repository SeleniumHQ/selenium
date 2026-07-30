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

LEVELS = {'error' => 'ERROR', 'warning' => 'WARN', 'info' => 'INFO', 'deprecated' => 'WARN'}.freeze

# Block matchers to capture logger output in memory and assert on contents
#
#   expect { do_thing }.to have_deprecated(:some_id)          # exact set of ids logged
#   expect { do_thing }.to have_deprecated(%i[id_a id_b])     # several ids at once
#   expect { do_thing }.not_to have_deprecated(:some_id)      # id was not logged
#
# When the logged message is from an external source, its content can be asserted with String or Regexp:
#
#   expect { do_thing }.to have_warning(:some_id, 'exact text')
LEVELS.each do |level, severity|
  # *args (not |ids, message = nil|) so a lone Array of ids isn't auto-splatted into (ids, message).
  RSpec::Matchers.define "have_#{level}" do |*args|
    ids, message = args
    match do |block|
      lines = capture_log_lines(&block).grep(/\A\S+ \S+ #{severity}\b/)
      lines = lines.grep(/\[DEPRECATION\]/) if level == 'deprecated'
      @found = lines.flat_map { |line| (line[/\[:[^\]]*\]/] || '').scan(/:(\w+)/).flatten }.map(&:to_sym)
      @expected = Array(ids).map(&:to_sym)

      next false unless @found.uniq.sort == @expected.uniq.sort
      next true if message.nil?

      @matching_lines = lines.select { |line| @expected.any? { |id| line.include?("[:#{id}]") } }
      @matching_lines.any? { |line| message.is_a?(Regexp) ? line.match?(message) : line.include?(message) }
    end

    failure_message do
      if @found.uniq.sort == @expected.uniq.sort
        "expected a #{@expected} entry matching #{message.inspect}, but logged: #{@matching_lines.map(&:strip)}"
      else
        found = @found.empty? ? 'nothing was logged' : "these ids were logged: #{@found.uniq}"
        "expected #{@expected} to have been logged, but #{found}"
      end
    end

    failure_message_when_negated do
      "expected #{@expected} not to have been logged, but it was found among: #{@found.uniq}"
    end

    def supports_block_expectations?
      true
    end

    # Suppresses logging output to stderr while capturing it, so an expected entry does not pollute
    # test output and an unexpected one still fails the assertion.
    def capture_log_lines
      default_output = Selenium::WebDriver.logger.io
      io = StringIO.new
      Selenium::WebDriver.logger.output = io

      begin
        yield
      rescue StandardError => e
        raise e, 'Can not evaluate output when statement raises an exception'
      ensure
        Selenium::WebDriver.logger.output = default_output
      end

      io.rewind
      io.read.split("\n")
    end
  end
end
