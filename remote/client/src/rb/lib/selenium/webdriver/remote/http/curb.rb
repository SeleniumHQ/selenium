require 'curb'

module Selenium
  module WebDriver
    module Remote
      module Http
        
        #
        # An alternative to the default Net::HTTP client. 
        # 
        # This can be used for the Firefox and Remote drivers if you have Curb
        # installed.
        # 
        # @example Using Curb
        # 
        #   include Selenium
        # 
        #   driver = WebDriver.for :firefox, :http_client => WebDriver::Remote::Http::Curb
        # 
        
        class Curb < Common

          private

          def request(verb, url, headers, payload)
            client.url     = url.to_s
            client.headers = headers

            case verb
            when :get
              client.http_get
            when :post
              client.post_body = payload || ""
              client.http_post
            when :put
              client.put_data = payload || ""
              client.http_put
            when :delete
              client.http_delete
            else
              raise Error::WebDriverError, "unknown HTTP verb: #{verb.inspect}"
            end

            create_response client.response_code, client.body_str, client.content_type
          end

          def client
            @client ||= (
              c = Curl::Easy.new
              c.max_redirects = MAX_REDIRECTS
              c.follow_location = true

              c
            )
          end

        end # Curb
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
