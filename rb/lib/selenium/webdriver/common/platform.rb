require 'rbconfig'
require 'socket'

module Selenium
  module WebDriver

    # @api private
    module Platform

      module_function

      def home
        # jruby has an issue with ENV['HOME'] on Windows
        @home ||= jruby? ? ENV_JAVA['user.home'] : ENV['HOME']
      end

      def engine
        @engine ||= (
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
        )
      end

      def bitsize
        @bitsize ||= (
          if defined?(FFI::Platform::ADDRESS_SIZE)
            FFI::Platform::ADDRESS_SIZE
          elsif defined?(FFI)
            FFI.type_size(:pointer) == 4 ? 32 : 64
          elsif jruby?
            Integer(ENV_JAVA['sun.arch.data.model'])
          else
            1.size == 4 ? 32 : 64
          end
        )
      end

      def jruby?
        engine == :jruby
      end

      def ironruby?
        engine == :ironruby
      end

      def ruby187?
        !!(RUBY_VERSION =~ /^1\.8\.7/)
      end

      def ruby19?
        !!(RUBY_VERSION =~ /^1\.9/)
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

      def cygwin?
        !!(RUBY_PLATFORM =~ /cygwin/)
      end

      def wrap_in_quotes_if_necessary(str)
        windows? && !cygwin? ? %{"#{str}"} : str
      end

      def cygwin_path(path, opts = {})
        flags = []
        opts.each { |k,v| flags << "--#{k}" if v }

        `cygpath #{flags.join ' '} "#{path}"`.strip
      end

      def make_writable(file)
        File.chmod 0766, file
      end

      def assert_file(path)
        unless File.file? path
          raise Error::WebDriverError, "not a file: #{path.inspect}"
        end
      end

      def assert_executable(path)
        assert_file(path)

        unless File.executable? path
          raise Error::WebDriverError, "not executable: #{path.inspect}"
        end
      end

      def exit_hook(&blk)
        pid = Process.pid

        at_exit do
          yield if Process.pid == pid
        end
      end

      def find_binary(*binary_names)
        paths = ENV['PATH'].split(File::PATH_SEPARATOR)
        binary_names.map! { |n| "#{n}.exe" } if windows?

        binary_names.each do |binary_name|
          paths.each do |path|
            exe = File.join(path, binary_name)
            return exe if File.executable?(exe)
          end
        end

        nil
      end

      def localhost
        info = Socket.getaddrinfo "localhost", 80, Socket::AF_INET, Socket::SOCK_STREAM

        if info.empty?
          raise Error::WebDriverError, "unable to translate 'localhost' for TCP + IPv4"
        end

        info[0][3]
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
      rescue Errno::ENETUNREACH
        # no external ip
      end

      def interfaces
        interfaces = Socket.getaddrinfo("localhost", 8080).map { |e| e[3] }
        interfaces += ["0.0.0.0", Platform.ip]

        interfaces.compact.uniq
      end

    end # Platform
  end # WebDriver
end # Selenium

if __FILE__ == $0
  p :engine     => Selenium::WebDriver::Platform.engine,
    :os         => Selenium::WebDriver::Platform.os,
    :ruby187?   => Selenium::WebDriver::Platform.ruby187?,
    :ruby19?    => Selenium::WebDriver::Platform.ruby19?,
    :jruby?     => Selenium::WebDriver::Platform.jruby?,
    :windows?   => Selenium::WebDriver::Platform.windows?,
    :home       => Selenium::WebDriver::Platform.home,
    :bitsize    => Selenium::WebDriver::Platform.bitsize,
    :localhost  => Selenium::WebDriver::Platform.localhost,
    :ip         => Selenium::WebDriver::Platform.ip,
    :interfaces => Selenium::WebDriver::Platform.interfaces
end
