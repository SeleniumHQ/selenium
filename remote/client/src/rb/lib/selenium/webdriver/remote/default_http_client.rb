require "net/http"

module Selenium
  module WebDriver
    module Remote
      class DefaultHttpClient
        CONTENT_TYPE    = "application/json"
        DEFAULT_HEADERS = { "Accept" => CONTENT_TYPE }

        class RetryException < StandardError; end

        def initialize(url)
          @server_url = url
        end

        def call(verb, url, *args)
          response = nil
          url      = @server_url.merge(url) unless url.kind_of?(URI)
          headers  = DEFAULT_HEADERS.dup

          if args.any?
            headers.merge!("Content-Type" => "#{CONTENT_TYPE}; charset=utf-8")
            payload = args.to_json
            puts "   >>> #{payload}" if $DEBUG
          end

          begin
            request = Net::HTTP.const_get(verb.to_s.capitalize).new(url.path, headers)

            # TODO: should be checking against a maximum redirect count
            http.request(request, payload) do |res|
              if res.kind_of? Net::HTTPRedirection
                verb, payload = :get, nil
                url           = URI.parse(res["Location"])
                raise RetryException
              else
                response = create_response(res)
              end
            end

            response
          rescue RetryException
            retry
          end
        end

        private

        def http
          # ignoring SSL for now
          @http ||= Net::HTTP.new @server_url.host, @server_url.port
        end

        def create_response(res)
          puts "<- #{res.body}\n" if $DEBUG
          if res.content_type == CONTENT_TYPE
            Response.new do |r|
              r.code         = res.code.to_i
              r.payload      = JSON.parse(res.body.strip)
            end
          elsif res.code == '204'
            Response.new { |r| r.code = res.code.to_i }
          else
            raise "Unexpected content type: #{res.content_type.inspect} (#{res.code})\n#{res.body}"
          end
        end

      end # DefaultHttpClient
    end # Remote
  end # WebDriver
end # Selenium