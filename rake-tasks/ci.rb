# frozen_string_literal: true

require 'uri'
require 'net/http'
require 'digest/md5'
require 'json'
require 'pathname'

def net_http
  http_proxy = ENV['http_proxy'] || ENV['HTTP_PROXY']
  if http_proxy
    http_proxy = "http://#{http_proxy}" unless http_proxy.start_with?('http://')
    proxy_uri = URI.parse(http_proxy)

    Net::HTTP::Proxy(proxy_uri.host, proxy_uri.port)
  else
    Net::HTTP
  end
end

# Luke - Sep 2019
# This method doesn't appear to have any caller locations and there is a duplicate much more complex
# method inside the /rb directory proper
#
# Removing this "should" in theory be ok. But will tackle it at a later date once other
# simplifications have been made!
#