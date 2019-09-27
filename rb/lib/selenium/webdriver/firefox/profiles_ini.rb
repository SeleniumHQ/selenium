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
    module Firefox
      # @api private
      class ProfilesIni
        def initialize
          @ini_path = File.join(Util.app_data_path, 'profiles.ini')
          @profile_paths = {}

          parse if File.exist?(@ini_path)
        end

        def [](name)
          path = @profile_paths[name]
          path && Profile.new(path)
        end

        def refresh
          @profile_paths.clear
          parse
        end

        private

        def parse
          string      = File.read @ini_path
          name        = nil
          is_relative = nil
          path        = nil

          string.split("\n").each do |line|
            case line
            when /^\[Profile/
              name, path = nil if path_for(name, is_relative, path)
            when /^Name=(.+)$/
              name = Regexp.last_match(1).strip
            when /^IsRelative=(.+)$/
              is_relative = Regexp.last_match(1).strip == '1'
            when /^Path=(.+)$/
              path = Regexp.last_match(1).strip
              p = path_for(name, is_relative, path)
              @profile_paths[name] = p if p
            end
          end
        end

        def path_for(name, is_relative, path)
          return unless [name, path].any?

          is_relative ? File.join(Util.app_data_path, path) : path
        end
      end # ProfilesIni
    end # Firefox
  end # WebDriver
end # Selenium
