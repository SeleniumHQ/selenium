module Selenium
  module WebDriver
    class Proxy
      TYPES = {
        :direct      => "DIRECT",     # Direct connection, no proxy (default on Windows).
        :manual      => "MANUAL",     # Manual proxy settings (e.g., for httpProxy).
        :pac         => "PAC",        # Proxy autoconfiguration from URL.
        :auto_detect => "AUTODETECT", # Proxy autodetection (presumably with WPAD).
        :system      => "SYSTEM"      # Use system settings (default on Linux).
      }

      attr_accessor :type,
                    :ftp,
                    :http,
                    :no_proxy,
                    :pac,
                    :ssl,
                    :auto_detect

      def default_options
        {
          :type         => :direct,
          :ftp          => nil,
          :http         => nil,
          :no_proxy     => nil,
          :pac          => nil,
          :ssl          => nil,
          :auto_detect  => nil
        }
      end

      def initialize(opts = {})
        opts          = default_options.merge(opts)
        
        self.type     = opts.delete :type
        @ftp          = opts.delete :ftp
        @http         = opts.delete :http
        @no_proxy     = opts.delete :no_proxy
        @pac          = opts.delete :pac
        @ssl          = opts.delete :ssl
        @auto_detect  = opts.delete :auto_detect

        unless opts.empty?
          raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
        end
      end
      
      def type=(type)
        unless TYPES.has_key? type
          raise ArgumentError, "invalid proxy type: #{type.inspect}, expected one of #{TYPES.keys.inspect}"
        end
        
        @type = type
      end

      def as_json(opts = nil)
        json_result = {
          "proxyType" => TYPES.fetch(type)
        }

        json_result["ftpProxy"]           = ftp if ftp
        json_result["httpProxy"]          = http if http
        json_result["noProxy"]            = no_proxy if no_proxy
        json_result["proxyAutoconfigUrl"] = pac if pac
        json_result["sslProxy"]           = ssl if ssl
        json_result["autodetect"]         = auto_detect if auto_detect

        json_result if json_result.length > 1
      end
      
    end # Proxy
  end # WebDriver
end # Selenium
