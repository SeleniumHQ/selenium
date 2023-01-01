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

        DEFAULT_PREFERENCES = {
          'browser.newtabpage.enabled' => false,
          'browser.startup.homepage' => 'about:blank',
          'browser.usedOnWindows10.introURL' => 'about:blank',
          'network.captive-portal-service.enabled' => false,
          'security.csp.enable' => false
        }.freeze

        attr_reader   :name, :log_file
        attr_writer   :secure_ssl, :load_no_focus_lib

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

          @additional_prefs = read_model_prefs
          @extensions = {}
        end

        def layout_on_disk
          profile_dir = @model ? create_tmp_copy(@model) : Dir.mktmpdir('webdriver-profile')
          FileReaper << profile_dir

          install_extensions(profile_dir)
          delete_lock_files(profile_dir)
          delete_extensions_cache(profile_dir)
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

        def port=(port)
          self[WEBDRIVER_PREFS[:port]] = port
        end

        def log_file=(file)
          @log_file = file
          self[WEBDRIVER_PREFS[:log_file]] = file
        end

        #
        # Add the extension (directory, .zip or .xpi) at the given path to the profile.
        #

        def add_extension(path, name = extension_name_for(path))
          @extensions[name] = Extension.new(path)
        end

        def proxy=(proxy)
          raise TypeError, "expected #{Proxy.name}, got #{proxy.inspect}:#{proxy.class}" unless proxy.is_a? Proxy

          case proxy.type
          when :manual
            self['network.proxy.type'] = 1

            set_manual_proxy_preference 'ftp', proxy.ftp
            set_manual_proxy_preference 'http', proxy.http
            set_manual_proxy_preference 'ssl', proxy.ssl
            set_manual_proxy_preference 'socks', proxy.socks

            self['network.proxy.no_proxies_on'] = proxy.no_proxy || ''
          when :pac
            self['network.proxy.type'] = 2
            self['network.proxy.autoconfig_url'] = proxy.pac
          when :auto_detect
            self['network.proxy.type'] = 4
          else
            raise ArgumentError, "unsupported proxy type #{proxy.type}"
          end
        end

        alias as_json encoded

        private

        def set_manual_proxy_preference(key, value)
          return unless value

          host, port = value.to_s.split(':', 2)

          self["network.proxy.#{key}"] = host
          self["network.proxy.#{key}_port"] = Integer(port) if port
        end

        def install_extensions(directory)
          destination = File.join(directory, 'extensions')

          @extensions.each do |name, extension|
            WebDriver.logger.debug({extenstion: name}.inspect)
            extension.write_to(destination)
          end
        end

        def read_model_prefs
          return {} unless @model

          read_user_prefs(File.join(@model, 'user.js'))
        end

        def delete_extensions_cache(directory)
          FileUtils.rm_f File.join(directory, 'extensions.cache')
        end

        def delete_lock_files(directory)
          %w[.parentlock parent.lock].each do |name|
            FileUtils.rm_f File.join(directory, name)
          end
        end

        def extension_name_for(path)
          File.basename(path, File.extname(path))
        end

        def update_user_prefs_in(directory)
          path = File.join(directory, 'user.js')
          prefs = read_user_prefs(path)
          prefs.merge! self.class::DEFAULT_PREFERENCES
          prefs.merge!(@additional_prefs)

          # If the user sets the home page, we should also start up there
          prefs['startup.homepage_welcome_url'] ||= prefs['browser.startup.homepage']

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
