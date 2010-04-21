require "patron"

module Selenium
  module WebDriver
    module Remote

      # @private
      class PatronHttpClient
        CONTENT_TYPE    = "application/json"
        DEFAULT_HEADERS = { "Accept" => CONTENT_TYPE, "Content-Length" => "0" }

        def initialize(url)
          @session = Patron::Session.new
          @session.base_url = url
        end

        def call(verb, url, command_hash)
          DEFAULT_HEADERS.each do |key, val|
            @session.headers[key] = val
          end

          if command_hash
            payload = command_hash.to_json
            @session.headers['Content-Type'] = "#{CONTENT_TYPE}; charset=utf-8;"
            @session.headers['Content-Length'] = payload.bytesize.to_s if [:post, :put].include?(verb)
            if $DEBUG
              puts "   >>> #{payload}"
              puts "     > #{@session.headers.inspect}"
            end
          end

          if [:post, :put].include?(verb)
            create_response @session.send(verb, url, payload || '')
          else
            create_response @session.send(verb, url)
          end
        end

        private

        def create_response(res)
          puts "<- #{res.body}\n" if $DEBUG
          if res.headers['Content-Type'].include? CONTENT_TYPE
            Response.new do |r|
              r.code         = res.status.to_i
              r.payload      = JSON.parse(res.body.strip)
            end
          elsif res.status == '204'
            Response.new { |r| r.code = res.code.to_i }
          else
            raise "Unexpected content type: #{res.headers.inspect} (#{res.status})\n#{res.body}"
          end
        end

      end # PatronHttpClient
    end # Remote
  end # WebDriver
end # Selenium
