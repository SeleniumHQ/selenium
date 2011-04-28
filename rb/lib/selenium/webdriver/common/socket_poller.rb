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
        addr = Socket.getaddrinfo(@host, nil)
        sock = Socket.new(Socket.const_get(addr[0][0]), Socket::SOCK_STREAM, 0)

        begin
          sock.connect_nonblock(Socket.pack_sockaddr_in(@port, addr[0][3]))
        rescue Errno::EINPROGRESS
          if IO.select(nil, [sock], nil, 1)
            begin
              sock.connect_nonblock(Socket.pack_sockaddr_in(@port, addr[0][3]))
            rescue Errno::EISCONN
              # yay!
            end
          else
            raise Errno::ECONNREFUSED
          end
        end

        sock.close
        true
      rescue *SOCKET_ERRORS => e
        $stderr.puts [@host, @port].inspect if $DEBUG
        false
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
