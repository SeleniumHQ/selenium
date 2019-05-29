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
      class Binary
        class << self
          #
          # @api private
          #
          # @see Firefox.path=
          #

          def path=(path)
            Platform.assert_executable(path)
            @path = path
          end

          def reset_path!
            @path = nil
          end

          def path
            @path ||= case Platform.os
                      when :macosx
                        macosx_path
                      when :windows
                        windows_path
                      when :linux, :unix
                        Platform.find_binary('firefox3', 'firefox2', 'firefox') || '/usr/bin/firefox'
                      else
                        raise Error::WebDriverError, "unknown platform: #{Platform.os}"
                      end

            @path = Platform.cygwin_path(@path, windows: true) if Platform.cygwin?

            unless File.file?(@path.to_s)
              error = "Could not find Firefox binary (os=#{Platform.os}). " \
                      "Make sure Firefox is installed or set the path manually with #{self}.path="
              raise Error::WebDriverError, error
            end

            @path
          end

          def version
            @version = case Platform.os
                       when :macosx
                         `#{path} -v`.strip[/[^\s]*$/][/^\d+/].to_i
                       when :windows
                         `\"#{path}\" -v | more`.strip[/[^\s]*$/][/^\d+/].to_i
                       when :linux
                         `#{path} -v`.strip[/[^\s]*$/][/^\d+/].to_i
                       else
                         0
                       end
          end

          private

          def windows_path
            windows_registry_path ||
              Platform.find_in_program_files('\\Mozilla Firefox\\firefox.exe') ||
              Platform.find_binary('firefox')
          end

          def macosx_path
            path = '/Applications/Firefox.app/Contents/MacOS/firefox-bin'
            path = File.expand_path('~/Applications/Firefox.app/Contents/MacOS/firefox-bin') unless File.exist?(path)
            path = Platform.find_binary('firefox-bin') unless File.exist?(path)

            path
          end

          def windows_registry_path
            require 'win32/registry'

            lm = Win32::Registry::HKEY_LOCAL_MACHINE
            lm.open('SOFTWARE\\Mozilla\\Mozilla Firefox') do |reg|
              main = lm.open("SOFTWARE\\Mozilla\\Mozilla Firefox\\#{reg.keys[0]}\\Main")
              entry = main.find { |key, _type, _data| /pathtoexe/i.match? key }
              return entry.last if entry
            end
          rescue LoadError
            # older JRuby or IronRuby does not have win32/registry
          rescue Win32::Registry::Error
          end
        end # class << self
      end # Binary
    end # Firefox
  end # WebDriver
end # Selenium
