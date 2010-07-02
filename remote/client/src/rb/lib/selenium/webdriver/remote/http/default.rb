require "net/https"

module Selenium
  module WebDriver
    module Remote
      module Http
        # @private
        class Default < Common

          private

          def http
            # ignoring SSL for now
            @http ||= (
              http = Net::HTTP.new @server_url.host, @server_url.port
              if @server_url.scheme == "https"
                http.use_ssl = true
                http.verify_mode = OpenSSL::SSL::VERIFY_NONE
              end

              if self.class.timeout
                http.connect_timeout = self.class.timeout
                http.read_timeout    = self.class.timeout
              end

              http
            )
          end

          def request(verb, url, headers, payload, redirects = 0)
            request = new_request_for(verb, url, headers)

            retried = false
            begin
              response = http.request(request, payload)
            rescue Errno::ECONNABORTED, Errno::ECONNRESET
              # this happens sometimes on windows?!
              raise if retried

              request = new_request_for(verb, url, headers)
              retried = true

              retry
            end

            if response.kind_of? Net::HTTPRedirection
              raise Error::WebDriverError, "too many redirects" if redirects >= MAX_REDIRECTS
              request(:get, URI.parse(response['Location']), DEFAULT_HEADERS.dup, nil, redirects + 1)
            else
              create_response response.code, response.body, response.content_type
            end
          end

          def new_request_for(verb, url, headers)
            Net::HTTP.const_get(verb.to_s.capitalize).new(url.path, headers)
          end

        end # Default
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
