module Selenium
  module WebDriver
    module Remote

      # @api private
      class Response

        attr_reader :code, :payload
        attr_writer :payload

        def initialize(code, payload = nil)
          @code    = code
          @payload = payload || {}

          assert_ok
        end

        def error
          klass = Error.for_code(status) || return

          ex = klass.new(error_message)
          ex.set_backtrace(caller)
          add_backtrace ex

          ex
        end

        def error_message
          val = value

          case val
          when Hash
            msg = val['message'] or return "unknown error"
            msg << " (#{ val['class'] })" if val['class']
          when String
            msg = val
          else
            msg = "unknown error, status=#{status}: #{val.inspect}"
          end

          msg
        end

        def [](key)
          @payload[key]
        end

        private

        def assert_ok
          if e = error()
            raise e
          elsif @code.nil? || @code >= 400
            raise Error::ServerError, self
          end
        end

        def add_backtrace(ex)
          unless value.kind_of?(Hash) && value['stackTrace']
            return
          end

          server_trace = value['stackTrace']

          backtrace = server_trace.map do |frame|
            next unless frame.kind_of?(Hash)

            file = frame['fileName']
            line = frame['lineNumber']
            meth = frame['methodName']

            if class_name = frame['className']
              file = "#{class_name}(#{file})"
            end

            if meth.nil? || meth.empty?
              meth = 'unknown'
            end

            "[remote server] #{file}:#{line}:in `#{meth}'"
          end.compact

          ex.set_backtrace(backtrace + ex.backtrace)
        end

        def status
          @payload['status']
        end

        def value
          @payload['value']
        end

      end # Response
    end # Remote
  end # WebDriver
end # Selenium
