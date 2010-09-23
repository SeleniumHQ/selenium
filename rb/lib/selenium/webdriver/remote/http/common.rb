module Selenium
  module WebDriver
    module Remote
      module Http
        class Common
          MAX_REDIRECTS   = 20 # same as chromium/gecko
          CONTENT_TYPE    = "application/json"
          DEFAULT_HEADERS = { "Accept" => CONTENT_TYPE, "Content-Length" => "0" }

          class << self
            attr_accessor :timeout
          end

          def initialize(url)
            @server_url = url
          end

          def call(verb, url, command_hash)
            url      = @server_url.merge(url) unless url.kind_of?(URI)
            headers  = DEFAULT_HEADERS.dup

            if command_hash
              payload                   = command_hash.to_json
              headers["Content-Type"]   = "#{CONTENT_TYPE}; charset=utf-8"
              headers["Content-Length"] = payload.bytesize.to_s if [:post, :put].include?(verb)

              if $DEBUG
                puts "   >>> #{payload}"
                puts "     > #{headers.inspect}"
              end
            end

            request verb, url, headers, payload
          end

          private

          def request(verb, url, headers, payload)
            raise NotImplementedError, "subclass responsibility"
          end

          def create_response(code, body, content_type)
            code, body, content_type = code.to_i, body.to_s.strip, content_type.to_s
            puts "<- #{body}\n" if $DEBUG

            if content_type.include? CONTENT_TYPE
              raise Error::WebDriverError, "empty body: #{content_type.inspect} (#{code})\n#{body}" if body.empty?
              Response.new(code, JSON.parse(body))
            elsif code == 204
              Response.new(code)
            else
              raise Error::WebDriverError, "unexpected content type: #{content_type.inspect} (#{code})\n#{body}"
            end
          end

        end # Common
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
