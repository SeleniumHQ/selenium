require 'selenium/webdriver/common/platform'
require 'socket'

module Selenium
  module WebDriver
    class SocketPoller

      def initialize(host, port, timeout = 0, interval = 0.25)
        @host     = host
        @port     = Integer(port)
        @timeout  = Float(timeout)
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

      CONNECT_TIMEOUT = 5

      NOT_CONNECTED_ERRORS = [Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError]
      NOT_CONNECTED_ERRORS << Errno::EPERM if Platform.cygwin?

      CONNECTED_ERRORS = [Errno::EISCONN]
      CONNECTED_ERRORS << Errno::EINVAL if Platform.windows?

      if Platform.jruby?
        # we use a plain TCPSocket here since JRuby has issues select()ing on a connecting socket
        # see http://jira.codehaus.org/browse/JRUBY-5165
        def listening?
          TCPSocket.new(@host, @port).close
          true
        rescue *NOT_CONNECTED_ERRORS
          false
        end
      else
        def listening?
          addr     = Socket.getaddrinfo(@host, @port, Socket::AF_INET, Socket::SOCK_STREAM)
          sock     = Socket.new(Socket::AF_INET, Socket::SOCK_STREAM, 0)
          sockaddr = Socket.pack_sockaddr_in(@port, addr[0][3])

          begin
            sock.connect_nonblock sockaddr
          rescue Errno::EINPROGRESS
            if IO.select(nil, [sock], nil, CONNECT_TIMEOUT)
              retry
            else
              raise Errno::ECONNREFUSED
            end
          rescue *CONNECTED_ERRORS
            # yay!
          end

          sock.close
          true
        rescue *NOT_CONNECTED_ERRORS
          $stderr.puts [@host, @port].inspect if $DEBUG
          false
        end
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
