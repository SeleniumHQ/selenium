module Selenium
  module WebDriver
    module Firefox

      # @private
      class Extension
        EM_NAMESPACE_URI = "http://www.mozilla.org/2004/em-rdf#" # not used?

        def initialize(path)
          unless File.exist?(path)
            raise Error::WebDriverError, "could not find extension at #{path.inspect}"
          end

          @path = path
        end

        def write_to(extensions_dir)
          ext_path = File.join extensions_dir, read_id_from_install_rdf(root)

          FileUtils.rm_rf ext_path
          FileUtils.mkdir_p File.dirname(ext_path), :mode => 0700
          FileUtils.cp_r root, ext_path
        end

        private

        def root
          @root ||= (
            if File.directory? @path
              @path
            else
              unless Zipper::EXTENSIONS.include? File.extname(@path)
                raise Error::WebDriverError, "expected #{Zipper::EXTENSIONS.join(" or ")}, got #{@path.inspect}"
              end

              Zipper.unzip(@path)
            end
          )
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