require "rbconfig"

module Selenium
  module WebDriver

    # @private
    module Platform

      module_function

      def home
        # jruby has an issue with ENV['HOME'] on Windows
        @home ||= jruby? ? ENV_JAVA['user.home'] : ENV['HOME']
      end

      def platform
        @platform ||= (
          if defined? RUBY_ENGINE
            RUBY_ENGINE.to_sym
          else
            :ruby
          end
        )
      end

      def os
        @os ||= (
          host_os = RbConfig::CONFIG['host_os']
          case host_os
          when /mswin|msys|mingw32/
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
        )
      end

      def bitsize
        @bitsize ||= (
          if defined?(FFI::BITSIZE)
            FFI::BITSIZE
          elsif defined?(FFI)
            FFI.type_size :pointer
          elsif jruby?
            Integer(ENV_JAVA['sun.arch.data.model'])
          else
            1.size == 4 ? 32 : 64
          end
        )
      end

      def jruby?
        platform == :jruby
      end

      def ironruby?
        platform == :ironruby
      end

      def ruby187?
        !!(RUBY_VERSION =~ /^1\.8\.7/)
      end

      def ruby19?
        !!(RUBY_VERSION =~ /^1\.9/)
      end

      def win?
        os == :windows
      end

      def mac?
        os == :macosx
      end

      def wrap_in_quotes_if_necessary(str)
        win? ? %{"#{str}"} : str
      end

      def make_writable(file)
        File.chmod 0766, file
      end

      def find_binary(*binary_names)
        paths = ENV['PATH'].split(File::PATH_SEPARATOR)
        binary_names.map! { |n| "#{n}.exe" } if win?

        binary_names.each do |binary_name|
          paths.each do |path|
            exe = File.join(path, binary_name)
            return exe if File.executable?(exe)
          end
        end

        nil
      end

    end # Platform
  end # WebDriver
end # Selenium

if __FILE__ == $0
  p :platform => Selenium::WebDriver::Platform.platform,
    :os       => Selenium::WebDriver::Platform.os,
    :ruby187? => Selenium::WebDriver::Platform.ruby187?,
    :ruby19?  => Selenium::WebDriver::Platform.ruby19?,
    :jruby?   => Selenium::WebDriver::Platform.jruby?,
    :win?     => Selenium::WebDriver::Platform.win?,
    :home     => Selenium::WebDriver::Platform.home,
    :bitsize  => Selenium::WebDriver::Platform.bitsize
end
