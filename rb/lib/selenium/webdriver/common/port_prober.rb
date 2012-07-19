module Selenium
  module WebDriver
    class PortProber
      def self.above(port)
        port += 1 until free? port
        port
      end

      def self.random
        # TODO: Avoid this
        #
        # (a) should pick a port that's guaranteed to be free on all interfaces
        # (b) should pick a random port outside the ephemeral port range
        #
        server = TCPServer.new(Platform.localhost, 0)
        port   = server.addr[1]
        server.close

        port
      end

      def self.free?(port)
        Platform.interfaces.each do |host|
          begin
            TCPServer.new(host, port).close
          rescue Errno::EADDRNOTAVAIL
            $stderr.puts "port prober could not bind to #{host}:#{port}" if $DEBUG
            # ignored - some machines appear unable to bind to some of their interfaces
          end
        end

        true
      rescue SocketError, Errno::EADDRINUSE
        false
      end

    end # PortProber
  end # WebDriver
end # Selenium
