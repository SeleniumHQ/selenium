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

require 'date'

module Selenium
  module Support
    #
    # Updates version in `version.rb` file with nightly suffix:
    #   - VERSION = '4.6.1'
    #   + VERSION = '4.6.1.nightly.20221126'
    #
    # @api private
    #

    class NightlyVersionGenerator
      REGEXP = /VERSION = ['"]([\d.]+)['"]/

      def self.call(version_file, version_suffix)
        version_suffix ||= Date.today.strftime('%Y%m%d')
        version_file_contents = File.read(version_file)
        version_file_contents.gsub!(REGEXP) do
          old_version = Regexp.last_match(1)
          new_version = [old_version, 'nightly', version_suffix].join('.')
          puts("#{old_version} -> #{new_version}")

          "VERSION = '#{new_version}'"
        end

        File.write(version_file, version_file_contents)
      end
    end # NightlyVersionGenerator
  end # Support
end # Selenium

if __FILE__ == $PROGRAM_NAME
  version_file, version_suffix = *ARGV
  Selenium::Support::NightlyVersionGenerator.call(version_file, version_suffix)
end
