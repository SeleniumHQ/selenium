require 'timeout'
require 'socket'

class TCPSocket
  
  def self.wait_for_service(options)
    verbose_wait until listening_service?(options)
  end
  
  def self.wait_for_service_termination(options)
    verbose_wait while listening_service?(options)
  end

  def self.listening_service?(options)
    Timeout::timeout(options[:timeout] || 20) do
      begin
        socket = TCPSocket.new(options[:host], options[:port])
        socket.close unless socket.nil?
        true
      rescue Errno::ECONNREFUSED, 
             Errno::EBADF           # Windows
        false
      end
    end
  end

  def self.verbose_wait
    puts ".\n"
    sleep 2
  end

end