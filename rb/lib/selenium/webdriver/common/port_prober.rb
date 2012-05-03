module Selenium
  module WebDriver
    class PortProber
      def self.above(port)
        port += 1 until free? port
        port
      end

      def self.random
        server = TCPServer.new(Platform.localhost, 0)
        port   = server.addr[1]
        server.close

        port
      end

      def self.free?(port)
        interfaces = Socket.getaddrinfo("localhost", port).map { |e| e[2] }
        interfaces += ["0.0.0.0", Platform.ip]
        interfaces.each { |address| TCPServer.new(address, port).close }

        true
      rescue SocketError, Errno::EADDRINUSE
        false
      end

    end # PortProber
  end # WebDriver
end # Selenium
