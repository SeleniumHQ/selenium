require "rbconfig"

module Selenium
  module WebDriver

    # @private
    module Platform

      module_function

      def home
        # jruby has an issue with ENV['HOME'] on Windows
        @home ||= Platform.jruby? ? Java.java.lang.System.getProperty('user.home') : ENV['HOME']
      end

      def platform
        @platform ||= begin
          if defined? RUBY_ENGINE
            RUBY_ENGINE.to_sym
          else
            :ruby
          end
        end
      end

      def os
        @os ||= begin
           case RbConfig::CONFIG['host_os']
           when /mswin|msys|mingw32/
             :windows
           when /darwin|mac os/
             :macosx
           when /linux/
             :linux
           when /solaris|bsd/
             :unix
           else
             # unlikely
             raise Error::WebDriverError, "unknown os #{RbConfig::CONFIG['host_os']}"
           end
        end
      end

      def bits
        @bits ||= (
          if %w[x86_64 amd64 i686].include? RbConfig::CONFIG['host_cpu']
            64
          else
            32
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
    :home     => Selenium::WebDriver::Platform.home
end
