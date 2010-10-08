require "socket"

module Selenium
  module WebDriver
    class SocketPoller

      def initialize(host, port, timeout = 0, interval = 0.25)
        @host    = host
        @port    = Integer(port)
        @timeout = Integer(timeout)
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
        sock = Socket.new(Socket.const_get(socket_addr[0]), Socket::SOCK_STREAM, 0)

        if defined?(Socket::SO_RCVTIMEO) && defined?(Socket::SO_SNDTIMEO)
          sock.setsockopt Socket::SOL_SOCKET, Socket::SO_RCVTIMEO, socket_timeout
          sock.setsockopt Socket::SOL_SOCKET, Socket::SO_SNDTIMEO, socket_timeout
        end

        sock.connect(Socket.pack_sockaddr_in(@port, socket_addr[3]))
        sock.close

        true
      rescue Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError => e
        $stderr.puts [@host, @port].inspect if $DEBUG
        false
      end

      def wait
        sleep @interval
      end

      def socket_timeout
        @socket_timeout ||= (
          secs = Integer(@timeout)
          usecs = Integer((@timeout - secs) * 1_000_000)

          [secs, usecs].pack("l_2")
        )
      end

      def socket_addr
        @socket_addr ||= (
          addr = Socket.getaddrinfo(@host, nil).first
          addr or raise Error::WebDriverError, "could not resolve #{@host.inspect}"
        )
      end


    end # SocketPoller
  end # WebDriver
end # Selenium

if __FILE__ == $0
  $DEBUG = true
  p Selenium::WebDriver::SocketPoller.new("127.0.0.1", 80, 5).success?
end
