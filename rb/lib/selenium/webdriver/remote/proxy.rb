module Selenium
  module WebDriver
    module Remote
      class Proxy
        module Type
          DIRECT      = "DIRECT"      # Direct connection, no proxy (default on Windows).
          MANUAL      = "MANUAL"      # Manual proxy settings (e.g., for httpProxy).
          PAC         = "PAC"         # Proxy autoconfiguration from URL.
          AUTODETECT  = "AUTODETECT"  # Proxy autodetection (presumably with WPAD).
          SYSTEM      = "SYSTEM"      # Use system settings (default on Linux).
        end

        attr_accessor :type,
                      :ftp,
                      :http,
                      :no_proxy,
                      :pac,
                      :ssl,
                      :auto_detect

        def default_options
          {
              :type         => Type::DIRECT,
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
          @type         = opts.delete(:type)
          @ftp          = opts.delete(:ftp)
          @http         = opts.delete(:http)
          @no_proxy     = opts.delete(:no_proxy)
          @pac          = opts.delete(:pac)
          @ssl          = opts.delete(:ssl)
          @auto_detect  = opts.delete(:auto_detect)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end
        end


        def as_json(opts = nil)
          json_result = {
            "proxyType"             => type
          }

          json_result["ftpProxy"]           = ftp if not ftp.nil?
          json_result["httpProxy"]          = http if not http.nil?
          json_result["noProxy"]            = no_proxy if not no_proxy.nil?
          json_result["proxyAutoconfigUrl"] = pac if not pac.nil?
          json_result["sslProxy"]           = ssl if not ssl.nil?
          json_result["autodetect"]         = auto_detect if not auto_detect.nil?

          json_result if json_result.length > 1
        end
      end
    end
  end
end