require 'zip'
require 'tempfile'
require 'find'

module Selenium
  module WebDriver
    #
    # @api private
    #

    module Zipper

      EXTENSIONS = %w[.zip .xpi]

      class << self

        def unzip(path)
          destination = Dir.mktmpdir("webdriver-unzip")
          FileReaper << destination

          Zip::File.open(path) do |zip|
            zip.each do |entry|
              to      = File.join(destination, entry.name)
              dirname = File.dirname(to)

              FileUtils.mkdir_p dirname unless File.exist? dirname
              zip.extract(entry, to)
            end
          end

          destination
        end

        def zip(path)
          with_tmp_zip do |zip|
            ::Find.find(path) do |file|
              unless File.directory?(file)
                add_zip_entry zip, file, file.sub("#{path}/", '')
              end
            end

            zip.commit
            File.open(zip.name, "rb") { |io| Base64.strict_encode64 io.read }
          end
        end

        def zip_file(path)
          with_tmp_zip do |zip|
            add_zip_entry zip, path, File.basename(path)

            zip.commit
            File.open(zip.name, "rb") { |io| Base64.strict_encode64 io.read }
          end
        end

        private

        def with_tmp_zip(&blk)
          # can't use Tempfile here since it doesn't support File::BINARY mode on 1.8
          # can't use Dir.mktmpdir(&blk) because of http://jira.codehaus.org/browse/JRUBY-4082
          tmp_dir = Dir.mktmpdir
          zip_path = File.join(tmp_dir, "webdriver-zip")

          begin
            Zip::File.open(zip_path, Zip::File::CREATE, &blk)
          ensure
            FileUtils.rm_rf tmp_dir
            FileUtils.rm_rf zip_path
          end
        end

        def add_zip_entry(zip, file, entry_name)
          entry = Zip::Entry.new(zip.name, entry_name)
          entry.follow_symlinks = true

          zip.add entry, file
        end

      end
    end # Zipper
  end # WebDriver
end # Selenium
