require "selenium/webdriver/common/platform"
require "socket"
require "timeout"

module Selenium
  module WebDriver
    class SocketPoller

      def initialize(host, port, timeout = 0, interval = 0.25)
        @host     = host
        @port     = Integer(port)
        @timeout  = Integer(timeout)
        @interval = interval
      end

      #
      # Returns true if the server is listening within the given timeout,
      # false otherwise.
      #
      # @return [Boolean]
      #

      def connected?
        with_timeout { listening? }
      end

      #
      # Returns true if the server has stopped listening within the given timeout,
      # false otherwise.
      #
      # @return [Boolean]
      #

      def closed?
        with_timeout { not listening? }
      end

      private

      SOCKET_ERRORS = [Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError]
      SOCKET_ERRORS << Errno::EPERM if Platform.cygwin?

      def listening?
        # There's a bug in 1.9.1 on Windows where this will succeed even if no
        # one is listening. Users who hit that should upgrade their Ruby.
        Timeout::timeout 5 do
          TCPSocket.new(@host, @port).close
        end
        true
      rescue *SOCKET_ERRORS => e
        $stderr.puts [@host, @port].inspect if $DEBUG
        false
      rescue Timeout::Error
        $stderr.puts "TCPSocket.new timed out" if $DEBUG
      end

      def with_timeout(&blk)
        max_time = Time.now + @timeout

        (
          return true if yield
          wait
        ) until Time.now > max_time

        false
      end

      def wait
        sleep @interval
      end

    end # SocketPoller
  end # WebDriver
end # Selenium
