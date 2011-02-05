module Selenium
  module WebDriver
    module IE

      #
      # @api private
      #

      class Server
        extend FFI::Library

        if Platform.bitsize == 64
          ffi_lib WebDriver::IE::DLLS[:x64]
        else
          ffi_lib WebDriver::IE::DLLS[:win32]
        end

        ffi_convention :stdcall

        attach_function :start_server,  :StartServer,           [:int],     :pointer
        attach_function :stop_server,   :StopServer,            [:pointer], :void
        attach_function :session_count, :GetServerSessionCount, [],         :int
        attach_function :current_port,  :GetServerPort,         [],         :int
        attach_function :is_running,    :ServerIsRunning,       [],         :bool

        def initialize
          @handle = nil
        end

        #
        # Starts the server, communicating on the specified port, if it is not already running
        #

        def start(start_port)
          return port if running?
          @handle = self.class.start_server(start_port)

          start_port
        end

        def stop
          return if session_count != 0 || @handle.nil?
          self.class.stop_server @handle
          @handle = nil
        end

        def running?
          self.class.is_running
        end

        def port
          self.class.current_port
        end

        private

        def session_count
          self.class.session_count
        end

      end # Server
    end # IE
  end # WebDriver
end # Selenium
