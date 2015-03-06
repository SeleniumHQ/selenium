require 'net/https'
require 'ipaddr'

module Selenium
  module WebDriver
    module Remote
      module Http

        # @api private
        class Default < Common
          attr_accessor :proxy

          private

          def http
            @http ||= (
              http = new_http_client
              if server_url.scheme == "https"
                http.use_ssl = true
                http.verify_mode = OpenSSL::SSL::VERIFY_NONE
              end

              if @timeout
                http.open_timeout = @timeout
                http.read_timeout = @timeout
              end

              http
            )
          end

          MAX_RETRIES = 3

          def request(verb, url, headers, payload, redirects = 0)
            request = new_request_for(verb, url, headers, payload)

            retries = 0
            begin
              response = response_for(request)
            rescue Errno::ECONNABORTED, Errno::ECONNRESET, Errno::EADDRINUSE
              # a retry is sometimes needed on Windows XP where we may quickly
              # run out of ephemeral ports
              #
              # A more robust solution is bumping the MaxUserPort setting
              # as described here:
              #
              # http://msdn.microsoft.com/en-us/library/aa560610%28v=bts.20%29.aspx
              raise if retries >= MAX_RETRIES

              request = new_request_for(verb, url, headers, payload)
              retries += 1

              retry
            rescue Errno::ECONNREFUSED => ex
              if use_proxy?
                raise ex.class, "using proxy: #{proxy.http}"
              else
                raise
              end
            end

            if response.kind_of? Net::HTTPRedirection
              raise Error::WebDriverError, "too many redirects" if redirects >= MAX_REDIRECTS
              request(:get, URI.parse(response['Location']), DEFAULT_HEADERS.dup, nil, redirects + 1)
            else
              create_response response.code, response.body, response.content_type
            end
          end

          def new_request_for(verb, url, headers, payload)
            req = Net::HTTP.const_get(verb.to_s.capitalize).new(url.path, headers)

            if server_url.userinfo
              req.basic_auth server_url.user, server_url.password
            end

            req.body = payload if payload

            req
          end

          def response_for(request)
            http.request request
          end

          def new_http_client
            if use_proxy?
              unless proxy.respond_to?(:http) && url = @proxy.http
                raise Error::WebDriverError, "expected HTTP proxy, got #{@proxy.inspect}"
              end

              proxy = URI.parse(url)

              clazz = Net::HTTP::Proxy(proxy.host, proxy.port, proxy.user, proxy.password)
              clazz.new(server_url.host, server_url.port)
            else
              Net::HTTP.new server_url.host, server_url.port
            end
          end

          def proxy
            @proxy ||= (
              proxy = ENV['http_proxy'] || ENV['HTTP_PROXY']
              no_proxy = ENV['no_proxy'] || ENV['NO_PROXY']

              if proxy
                proxy = "http://#{proxy}" unless proxy.start_with?("http://")
                Proxy.new(:http => proxy, :no_proxy => no_proxy)
              end
            )
          end

          def use_proxy?
            return false if proxy.nil?

            if proxy.no_proxy
              ignored = proxy.no_proxy.split(",").any? do |host|
                host == "*" ||
                host == server_url.host || (
                  begin
                    IPAddr.new(host).include?(server_url.host)
                  rescue ArgumentError
                    false
                  end
                )

              end

              not ignored
            else
              true
            end
          end

        end # Default
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
