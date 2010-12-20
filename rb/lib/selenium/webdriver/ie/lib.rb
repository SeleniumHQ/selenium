module Selenium
  module WebDriver
    module IE

      #
      # @api private
      #

      module Lib
        extend FFI::Library

        if Platform.bitsize == 64
          ffi_lib WebDriver::IE::DLLS[:x64]
        else
          ffi_lib WebDriver::IE::DLLS[:win32]
        end

        ffi_convention :stdcall

        attach_function :start_server, :StartServer, [:int],     :pointer
        attach_function :stop_server,  :StopServer,  [:pointer], :void

      end # Lib
    end # IE
  end # WebDriver
end # Selenium
