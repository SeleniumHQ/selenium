module Selenium
  module WebDriver
    module Safari
      class Options
        attr_accessor :port, :data_dir, :skip_extension_installation
        attr_reader :extensions

        def initialize(opts = {})
          @extensions = []
          extract_options(opts)
        end

        def add_extension(ext)
          @extensions << verify_safari_extension(ext)
        end

        def clean_session?
          !!@clean_session
        end

        def skip_extension_installation?
          !!@skip_extension_installation
        end

        def to_capabilities
          caps = Remote::Capabilities.safari
          caps.merge!('safari.options' => as_json)

          caps
        end

        def as_json
          {
            'port'                      => port,
            'dataDir'                   => data_dir,
            'cleanSession'              => clean_session?,
            'extensions'                => extensions_as_json,
            'skipExtensionInstallation' => skip_extension_installation?
          }
        end

        private

        def extensions_as_json
          @extensions.map do |path|
            {'filename' => path.basename, 'contents' => Base64.strict_encode64(path.read) }
          end
        end

        def extract_options(opts)
          @port          = Integer(opts[:port] || PortProber.random)
          @data_dir      = opts[:custom_data_dir] || opts[:data_dir]
          @clean_session = opts[:clean_session]

          Array(opts[:extensions]).each { |ext| add_extension(ext) }

          if opts.key?(:install_extension)
            @skip_extension_installation = !opts[:install_extension]
          elsif opts.key?(:skip_extension_installation)
            @skip_extension_installation = opts[:skip_extension_installation]
          else
            @skip_extension_installation = false
          end
        end

        def verify_safari_extension(path)
          pn = Pathname.new(path)

          unless pn.file? && pn.extname == '.safariextz'
            raise ArgumentError, "invalid Safari extension path: #{path}"
          end

          pn
        end

      end
    end
  end
end