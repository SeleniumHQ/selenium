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
        direct: 'DIRECT', # Direct connection, no proxy (default on Windows).
        manual: 'MANUAL', # Manual proxy settings (e.g., for httpProxy).
        pac: 'PAC', # Proxy autoconfiguration from URL.
        auto_detect: 'AUTODETECT', # Proxy autodetection (presumably with WPAD).
        system: 'SYSTEM' # Use system settings (default on Linux).
      }.freeze

      ALLOWED = {type: 'proxyType',
                 ftp: 'ftpProxy',
                 http: 'httpProxy',
                 no_proxy: 'noProxy',
                 pac: 'proxyAutoconfigUrl',
                 ssl: 'sslProxy',
                 auto_detect: 'autodetect',
                 socks: 'socksProxy',
                 socks_username: 'socksUsername',
                 socks_password: 'socksPassword'}.freeze

      ALLOWED.each_key { |t| attr_reader t }

      def self.json_create(data)
        data['proxyType'] = data['proxyType'].downcase.to_sym
        return if data['proxyType'] == :unspecified

        proxy = new

        ALLOWED.each do |k, v|
          proxy.send("#{k}=", data[v]) if data.key?(v)
        end

        proxy
      end

      def initialize(opts = {})
        not_allowed = []

        opts.each do |k, v|
          if ALLOWED.key?(k)
            send("#{k}=", v)
          else
            not_allowed << k
          end
        end

        return if not_allowed.empty?
        raise ArgumentError, "unknown option#{'s' if not_allowed.size != 1}: #{not_allowed.inspect}"
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
          'proxyType' => TYPES[type],
          'ftpProxy' => ftp,
          'httpProxy' => http,
          'noProxy' => no_proxy,
          'proxyAutoconfigUrl' => pac,
          'sslProxy' => ssl,
          'autodetect' => auto_detect,
          'socksProxy' => socks,
          'socksUsername' => socks_username,
          'socksPassword' => socks_password
        }.delete_if { |_k, v| v.nil? }

        json_result if json_result.length > 1
      end

      def to_json(*)
        JSON.generate as_json
      end
    end # Proxy
  end # WebDriver
end # Selenium
