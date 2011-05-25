module Selenium
  module WebDriver
    module Firefox

      # @api private
      class Extension
        def initialize(path)
          unless File.exist?(path)
            raise Error::WebDriverError, "could not find extension at #{path.inspect}"
          end

          @path             = path
          @should_reap_root = false
        end

        def write_to(extensions_dir)
          root_dir = create_root
          ext_path = File.join extensions_dir, read_id_from_install_rdf(root_dir)

          FileUtils.rm_rf ext_path
          FileUtils.mkdir_p File.dirname(ext_path), :mode => 0700
          FileUtils.cp_r root_dir, ext_path

          FileReaper.reap(root_dir) if @should_reap_root
        end

        private

        def create_root
          if File.directory? @path
            @path
          else
            unless Zipper::EXTENSIONS.include? File.extname(@path)
              raise Error::WebDriverError, "expected #{Zipper::EXTENSIONS.join(" or ")}, got #{@path.inspect}"
            end

            @should_reap_root = true
            Zipper.unzip(@path)
          end
        end

        def read_id_from_install_rdf(directory)
          rdf_path = File.join(directory, "install.rdf")
          doc = REXML::Document.new(File.read(rdf_path))

          REXML::XPath.first(doc, "//em:id").text
        end

      end # Extension
    end # Firefox
  end # WebDriver
end # Selenium
