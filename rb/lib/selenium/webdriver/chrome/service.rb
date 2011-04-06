module Selenium
  module WebDriver
    module Chrome
      
      #
      # @api private
      # 
      
      class Service
        START_TIMEOUT = 20
        STOP_TIMEOUT = 5
        
        attr_reader :uri
        
        def self.executable_path
          @executable_path ||= Platform.find_binary "chromedriver"
        end
        
        def self.executable_path=(path)
          Platform.assert_executable path
          @executable_path = path
        end
        
        def self.default_service
          new executable_path, 9515 # TODO: random port
        end
        
        def initialize(executable_path, port)
          @uri           = URI.parse "http://#{Platform.localhost}:#{port}"
          @process       = ChildProcess.build executable_path, "--port=#{port}"
          @socket_poller = SocketPoller.new Platform.localhost, port, START_TIMEOUT
          
          @process.io.inherit! if $DEBUG == true
        end
        
        def start
          @process.start
          
          unless @socket_poller.connected?
            raise Error::WebDriverError, "unable to connect to chromedriver #{@uri}"
          end
        end
        
        def stop
          return if @process.nil? || @process.exited?
          
          Net::HTTP.get uri.host, '/shutdown', uri.port         
          @process.poll_for_exit STOP_TIMEOUT
        rescue ChildProcess::TimeoutError
          # ok, force quit
          @process.stop STOP_TIMEOUT
        end
      end # Service
      
    end # Chrome
  end # WebDriver
end # Service