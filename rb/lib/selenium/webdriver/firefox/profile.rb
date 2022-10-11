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
      class Profile
        include ProfileHelper

        VALID_PREFERENCE_TYPES = [TrueClass, FalseClass, Integer, Float, String].freeze

        class << self
          def ini
            @ini ||= ProfilesIni.new
          end

          def from_name(name)
            profile = ini[name]
            return profile if profile

            raise Error::WebDriverError, "unable to find profile named: #{name.inspect}"
          end

          def decoded(json)
            JSON.parse(json)
          end
        end

        #
        # Create a new Profile instance
        #
        # @example User configured profile
        #
        #   profile = Selenium::WebDriver::Firefox::Profile.new
        #   profile['network.proxy.http'] = 'localhost'
        #   profile['network.proxy.http_port'] = 9090
        #
        #   driver = Selenium::WebDriver.for :firefox, :profile => profile
        #

        def initialize(model = nil)
          @model = verify_model(model)

          @additional_prefs = @model ? read_user_prefs(File.join(@model, 'user.js')) : {}
        end

        def layout_on_disk
          profile_dir = @model ? create_tmp_copy(@model) : Dir.mktmpdir('webdriver-profile')
          FileReaper << profile_dir

          delete_lock_files(profile_dir)
          update_user_prefs_in(profile_dir)

          profile_dir
        end

        #
        # Set a preference for this particular profile.
        #
        # @see http://kb.mozillazine.org/About:config_entries
        # @see http://preferential.mozdev.org/preferences.html
        #

        def []=(key, value)
          unless VALID_PREFERENCE_TYPES.any? { |e| value.is_a? e }
            raise TypeError, "expected one of #{VALID_PREFERENCE_TYPES.inspect}, got #{value.inspect}:#{value.class}"
          end

          if value.is_a?(String) && Util.stringified?(value)
            raise ArgumentError, "preference values must be plain strings: #{key.inspect} => #{value.inspect}"
          end

          @additional_prefs[key.to_s] = value
        end

        alias_method :as_json, :encoded

        private

        def delete_lock_files(directory)
          %w[.parentlock parent.lock].each do |name|
            FileUtils.rm_f File.join(directory, name)
          end
        end

        def update_user_prefs_in(directory)
          path = File.join(directory, 'user.js')
          prefs = read_user_prefs(path)
          prefs.merge!(@additional_prefs)

          write_prefs prefs, path
        end

        def read_user_prefs(path)
          prefs = {}
          return prefs unless File.exist?(path)

          File.read(path).split("\n").each do |line|
            next unless line =~ /user_pref\("([^"]+)"\s*,\s*(.+?)\);/

            key = Regexp.last_match(1).strip
            value = Regexp.last_match(2).strip

            # wrap the value in an array to make it a valid JSON string.
            prefs[key] = JSON.parse("[#{value}]").first
          end

          prefs
        end

        def write_prefs(prefs, path)
          File.open(path, 'w') do |file|
            prefs.each do |key, value|
              file.puts %{user_pref("#{key}", #{value.to_json});}
            end
          end
        end
      end # Profile
    end # Firefox
  end # WebDriver
end # Selenium
