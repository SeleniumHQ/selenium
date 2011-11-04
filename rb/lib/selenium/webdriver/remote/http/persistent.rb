require 'net/http/persistent'

module Selenium
  module WebDriver
    module Remote
      module Http

        # @api private
        class Persistent < Default

          def close
            @http.shutdown if @http
          end

          private

          def new_http_client
            proxy = nil

            if @proxy
              unless @proxy.respond_to?(:http) && url = @proxy.http
                raise Error::WebDriverError, "expected HTTP proxy, got #{@proxy.inspect}"
              end
              proxy = URI.parse(url)
            end

            Net::HTTP::Persistent.new "webdriver", proxy
          end

          def response_for(request)
            http.request server_url, request
          end

        end # Persistent
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
