# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

module Selenium
  module WebDriver
    class Proxy
      TYPES = {
        direct: "DIRECT",     # Direct connection, no proxy (default on Windows).
        manual: "MANUAL",     # Manual proxy settings (e.g., for httpProxy).
        pac: "PAC", # Proxy autoconfiguration from URL.
        auto_detect: "AUTODETECT", # Proxy autodetection (presumably with WPAD).
        system: "SYSTEM" # Use system settings (default on Linux).
      }

      attr_reader :type,
                  :ftp,
                  :http,
                  :socks,
                  :socks_username,
                  :socks_password,
                  :no_proxy,
                  :pac,
                  :ssl,
                  :auto_detect

      def initialize(opts = {})
        opts = opts.dup

        self.type           = opts.delete(:type) if opts.key? :type
        self.ftp            = opts.delete(:ftp) if opts.key? :ftp
        self.http           = opts.delete(:http) if opts.key? :http
        self.no_proxy       = opts.delete(:no_proxy) if opts.key? :no_proxy
        self.ssl            = opts.delete(:ssl) if opts.key? :ssl
        self.pac            = opts.delete(:pac) if opts.key? :pac
        self.auto_detect    = opts.delete(:auto_detect) if opts.key? :auto_detect
        self.socks          = opts.delete(:socks) if opts.key? :socks
        self.socks_username = opts.delete(:socks_username) if opts.key? :socks_username
        self.socks_password = opts.delete(:socks_password) if opts.key? :socks_password

        return if opts.empty?
        raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
      end

      def ==(other)
        other.is_a?(self.class) && as_json == other.as_json
      end
      alias_method :eql?, :==

      def ftp=(value)
        self.type = :manual
        @ftp = value
      end

      def http=(value)
        self.type = :manual
        @http = value
      end

      def no_proxy=(value)
        self.type = :manual
        @no_proxy = value
      end

      def ssl=(value)
        self.type = :manual
        @ssl = value
      end

      def pac=(url)
        self.type = :pac
        @pac = url
      end

      def auto_detect=(bool)
        self.type = :auto_detect
        @auto_detect = bool
      end

      def socks=(value)
        self.type = :manual
        @socks = value
      end

      def socks_username=(value)
        self.type = :manual
        @socks_username = value
      end

      def socks_password=(value)
        self.type = :manual
        @socks_password = value
      end

      def type=(type)
        unless TYPES.key? type
          raise ArgumentError, "invalid proxy type: #{type.inspect}, expected one of #{TYPES.keys.inspect}"
        end

        if defined?(@type) && type != @type
          raise ArgumentError, "incompatible proxy type #{type.inspect} (already set to #{@type.inspect})"
        end

        @type = type
      end

      def as_json(*)
        json_result = {
          "proxyType" => TYPES[type]
        }

        json_result["ftpProxy"]           = ftp if ftp
        json_result["httpProxy"]          = http if http
        json_result["noProxy"]            = no_proxy if no_proxy
        json_result["proxyAutoconfigUrl"] = pac if pac
        json_result["sslProxy"]           = ssl if ssl
        json_result["autodetect"]         = auto_detect if auto_detect
        json_result["socksProxy"]         = socks if socks
        json_result["socksUsername"]      = socks_username if socks_username
        json_result["socksPassword"]      = socks_password if socks_password

        json_result if json_result.length > 1
      end

      def to_json(*)
        JSON.generate as_json
      end

      class << self
        def json_create(data)
          return if data['proxyType'] == 'UNSPECIFIED'

          proxy = new

          proxy.type           = data['proxyType'].downcase.to_sym if data.key? 'proxyType'
          proxy.ftp            = data['ftpProxy'] if data.key? 'ftpProxy'
          proxy.http           = data['httpProxy'] if data.key? 'httpProxy'
          proxy.no_proxy       = data['noProxy'] if data.key? 'noProxy'
          proxy.pac            = data['proxyAutoconfigUrl'] if data.key? 'proxyAutoconfigUrl'
          proxy.ssl            = data['sslProxy'] if data.key? 'sslProxy'
          proxy.auto_detect    = data['autodetect'] if data.key? 'autodetect'
          proxy.socks          = data['socksProxy'] if data.key? 'socksProxy'
          proxy.socks_username = data['socksUsername'] if data.key? 'socksUsername'
          proxy.socks_password = data['socksPassword'] if data.key? 'socksPassword'

          proxy
        end
      end # class << self
    end # Proxy
  end # WebDriver
end # Selenium
