require "net/http"

module Selenium
  module WebDriver
    module Remote
      module Http
        # @private
        class Default < Common

          private

          def http
            # ignoring SSL for now
            @http ||= Net::HTTP.new @server_url.host, @server_url.port
          end

          def request(verb, url, headers, payload, redirects = 0)
            request = Net::HTTP.const_get(verb.to_s.capitalize).new(url.path, headers)

            retried = false
            begin
              response = http.request(request, payload)
            rescue Errno::ECONNABORTED, Errno::ECONNRESET
              # this happens sometimes on windows?!
              raise if retried
              retried  = true
              retry
            end

            if response.kind_of? Net::HTTPRedirection
              raise Error::WebDriverError, "too many redirects" if redirects >= MAX_REDIRECTS
              request(:get, URI.parse(response['Location']), DEFAULT_HEADERS.dup, nil, redirects + 1)
            else
              create_response response.code.to_i, response.body.strip, response.content_type
            end
          end

        end # Default
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
