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
        TCPServer.new(Platform.localhost, port).close
        true
      rescue SocketError, Errno::EADDRINUSE
        false
      end
    end # PortProber
  end # WebDriver
end # Selenium
