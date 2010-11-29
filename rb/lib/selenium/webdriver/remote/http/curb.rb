require 'curb'

module Selenium
  module WebDriver
    module Remote

      # added for rescue
      Bridge::QUIT_ERRORS << Curl::Err::RecvError

      module Http

        #
        # An alternative to the default Net::HTTP client.
        #
        # This can be used for the Firefox and Remote drivers if you have Curb
        # installed.
        #
        # @example Using Curb
        #   require 'selenium/webdriver/remote/http/curb'
        #   include Selenium
        #
        #   driver = WebDriver.for :firefox, :http_client => WebDriver::Remote::Http::Curb.new
        #

        class Curb < Common

          private

          def request(verb, url, headers, payload)
            client.url     = url.to_s

            # workaround for http://github.com/taf2/curb/issues/issue/40
            # curb will handle this for us anyway
            headers.delete "Content-Length"

            client.headers = headers

            # http://github.com/taf2/curb/issues/issue/33
            client.head   = false
            client.delete = false

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
            when :head
              client.http_head
            else
              raise Error::WebDriverError, "unknown HTTP verb: #{verb.inspect}"
            end

            create_response client.response_code, client.body_str, client.content_type
          end

          def client
            @client ||= (
              c = Curl::Easy.new

              c.max_redirects   = MAX_REDIRECTS
              c.follow_location = true
              c.timeout         = @timeout if @timeout
              c.verbose         = !!$DEBUG

              c
            )
          end

        end # Curb
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
