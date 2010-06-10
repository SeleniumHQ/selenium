module Selenium
  module WebDriver
    module Remote

      # @private
      class Response

        attr_reader :code, :payload
        attr_writer :payload

        def initialize(code, payload = nil)
          @code    = code
          @payload = payload || {}

          assert_ok
        end

        def error
          Error.for_code @payload['status']
        end

        def error_message
          @payload['value']['message']
        end

        def [](key)
          @payload[key]
        end

        private

        def assert_ok
          if @code.nil? || @code >= 400
            if e = error()
              raise(e, error_message)
            else
              raise Error::ServerError, self
            end
          end
        end

      end # Response
    end # Remote
  end # WebDriver
end # Selenium
