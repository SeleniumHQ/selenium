require 'zip/zip'
require 'tempfile'
require 'find'

module Selenium
  module WebDriver
    module Zipper

      EXTENSIONS = %w[.zip .xpi]

      def self.unzip(path)
        destination = Dir.mktmpdir("unzip")
        FileReaper << destination

        Zip::ZipFile.open(path) do |zip|
          zip.each do |entry|
            to      = File.join(destination, entry.name)
            dirname = File.dirname(to)

            FileUtils.mkdir_p dirname unless File.exist? dirname
            zip.extract(entry, to)
          end
        end

        destination
      end

      def self.zip(path)
        # can't use Tempfile here since it doesn't support File::BINARY mode on 1.8
        Dir.mktmpdir { |tmp_dir|
          zip_path = File.join(tmp_dir, "webdriver-zip")

          Zip::ZipFile.open(zip_path, Zip::ZipFile::CREATE) { |zip|
            ::Find.find(path) do |file|
              next if File.directory?(file)
              entry = file.sub("#{path}/", '')

              zip.add entry, file
            end
          }

          File.open(zip_path, "rb") { |io| Base64.encode64 io.read }
        }
      end

    end # Zipper
  end # WebDriver
end # Selenium
