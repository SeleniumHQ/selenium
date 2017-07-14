# encoding: utf-8
#
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
        NO_FOCUS_LIBRARY_NAME = 'x_ignore_nofocus.so'.freeze
        NO_FOCUS_LIBRARIES = [
          ["#{WebDriver.root}/selenium/webdriver/firefox/native/linux/amd64/#{NO_FOCUS_LIBRARY_NAME}",
           "amd64/#{NO_FOCUS_LIBRARY_NAME}"],
          ["#{WebDriver.root}/selenium/webdriver/firefox/native/linux/x86/#{NO_FOCUS_LIBRARY_NAME}",
           "x86/#{NO_FOCUS_LIBRARY_NAME}"]
        ].freeze

        WAIT_TIMEOUT = 90
        QUIT_TIMEOUT = 5

        def start_with(profile, profile_path, *args)
          if Platform.cygwin?
            profile_path = Platform.cygwin_path(profile_path, windows: true)
          elsif Platform.windows?
            profile_path = profile_path.tr('/', '\\')
          end

          ENV['XRE_CONSOLE_LOG'] = profile.log_file if profile.log_file
          ENV['XRE_PROFILE_PATH'] = profile_path
          ENV['MOZ_NO_REMOTE'] = '1' # able to launch multiple instances
          ENV['MOZ_CRASHREPORTER_DISABLE'] = '1' # disable breakpad
          ENV['NO_EM_RESTART'] = '1' # prevent the binary from detaching from the console

          if Platform.linux? && (profile.native_events? || profile.load_no_focus_lib?)
            modify_link_library_path profile_path
          end

          execute(*args)
        end

        def quit
          return unless @process
          @process.poll_for_exit QUIT_TIMEOUT
        rescue ChildProcess::TimeoutError
          # ok, force quit
          @process.stop QUIT_TIMEOUT
        end

        def wait
          return unless @process

          begin
            @process.poll_for_exit(WAIT_TIMEOUT)
          rescue ChildProcess::TimeoutError => e
            @process.stop
            raise e
          end
        end

        private

        def execute(*extra_args)
          args = [self.class.path, '-no-remote'] + extra_args
          @process = ChildProcess.build(*args)
          WebDriver.logger.debug("Executing Process #{args}")

          @process.io.stdout = @process.io.stderr = WebDriver.logger.io if WebDriver.logger.debug?
          @process.start
        end

        def modify_link_library_path(profile_path)
          paths = []

          NO_FOCUS_LIBRARIES.each do |from, to|
            dest = File.join(profile_path, to)
            FileUtils.mkdir_p File.dirname(dest)
            FileUtils.cp from, dest

            paths << File.expand_path(File.dirname(dest))
          end

          paths += ENV['LD_LIBRARY_PATH'].to_s.split(File::PATH_SEPARATOR)

          ENV['LD_LIBRARY_PATH'] = paths.uniq.join(File::PATH_SEPARATOR)
          ENV['LD_PRELOAD'] = NO_FOCUS_LIBRARY_NAME
        end

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

            @path = Platform.cygwin_path(@path) if Platform.cygwin?

            unless File.file?(@path.to_s)
              error = "Could not find Firefox binary (os=#{Platform.os}). "
              error << "Make sure Firefox is installed or set the path manually with #{self}.path="
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
              entry = main.find { |key, _type, _data| key =~ /pathtoexe/i }
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
