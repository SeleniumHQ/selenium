require "socket"

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
      # @return true if the socket can be connected to
      #

      def success?
        max_time = Time.now + @timeout

        (
          return true if can_connect?
          wait
        ) until Time.now >= max_time

        false
      end

      private

      def can_connect?
        # There's a bug in 1.9.1 on Windows where this will succeed even if no
        # one is listening. Users who hit that should upgrade their Ruby.
        TCPSocket.new(@host, @port).close
        true
      rescue Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError => e
        $stderr.puts [@host, @port].inspect if $DEBUG
        false
      end

      def wait
        sleep @interval
      end

    end # SocketPoller
  end # WebDriver
end # Selenium
