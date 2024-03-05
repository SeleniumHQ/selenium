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

require 'rbconfig'
require 'socket'

module Selenium
  module WebDriver
    # @api private
    module Platform
      module_function

      def home
        @home ||= Dir.home
      end

      def engine
        @engine ||= RUBY_ENGINE.to_sym
      end

      def os
        host_os = RbConfig::CONFIG['host_os']
        @os ||= case host_os
                when /mswin|msys|mingw|cygwin|bccwin|wince|emc/
                  :windows
                when /darwin|mac os/
                  :macosx
                when /linux/
                  :linux
                when /solaris|bsd/
                  :unix
                else
                  raise Error::WebDriverError, "unknown os: #{host_os.inspect}"
                end
      end

      def ci
        if ENV['TRAVIS']
          :travis
        elsif ENV['JENKINS']
          :jenkins
        elsif ENV['APPVEYOR']
          :appveyor
        elsif ENV['GITHUB_ACTIONS']
          :github
        end
      end

      def jruby?
        engine == :jruby
      end

      def truffleruby?
        engine == :truffleruby
      end

      def ruby_version
        RUBY_VERSION
      end

      def windows?
        os == :windows
      end

      def mac?
        os == :macosx
      end

      def linux?
        os == :linux
      end

      def unix?
        os == :unix
      end

      def wsl?
        return false unless linux?

        File.read('/proc/version').downcase.include?('microsoft')
      rescue Errno::EACCES
        # the file cannot be accessed on Linux on DeX
        false
      end

      def cygwin?
        RUBY_PLATFORM.include?('cygwin')
      end

      def null_device
        File::NULL
      end

      def wrap_in_quotes_if_necessary(str)
        windows? && !cygwin? ? %("#{str}") : str
      end

      def cygwin_path(path, only_cygwin: false, **opts)
        return path if only_cygwin && !cygwin?

        flags = []
        opts.each { |k, v| flags << "--#{k}" if v }

        `cygpath #{flags.join ' '} "#{path}"`.strip
      end

      def unix_path(path)
        path.tr(File::ALT_SEPARATOR, File::SEPARATOR)
      end

      def windows_path(path)
        path.tr(File::SEPARATOR, File::ALT_SEPARATOR)
      end

      def make_writable(file)
        File.chmod 0o766, file
      end

      def assert_file(path)
        return if File.file? path

        raise Error::WebDriverError, "not a file: #{path.inspect}"
      end

      def assert_executable(path)
        assert_file(path)

        return if File.executable? path

        raise Error::WebDriverError, "not executable: #{path.inspect}"
      end

      def exit_hook
        pid = Process.pid

        at_exit { yield if Process.pid == pid }
      end

      def localhost
        info = Socket.getaddrinfo 'localhost', 80, Socket::AF_INET, Socket::SOCK_STREAM

        return info[0][3] unless info.empty?

        raise Error::WebDriverError, "unable to translate 'localhost' for TCP + IPv4"
      end

      def ip
        orig = Socket.do_not_reverse_lookup
        Socket.do_not_reverse_lookup = true

        begin
          UDPSocket.open do |s|
            s.connect '8.8.8.8', 53
            return s.addr.last
          end
        ensure
          Socket.do_not_reverse_lookup = orig
        end
      rescue Errno::ENETUNREACH, Errno::EHOSTUNREACH
        # no external ip
      end

      def interfaces
        interfaces = Socket.getaddrinfo('localhost', 8080).map { |e| e[3] }
        interfaces += ['0.0.0.0', Platform.ip]

        interfaces.compact.uniq
      end
    end # Platform
  end # WebDriver
end # Selenium
