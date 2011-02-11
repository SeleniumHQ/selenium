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
        tmp_zip = Tempfile.new("webdriver-zip", :mode => File::BINARY)

        begin
          zos = Zip::ZipOutputStream.new(tmp_zip.path)

          ::Find.find(path) do |file|
            next if File.directory?(file)
            entry = file.sub("#{path}/", '')

            zos.put_next_entry(entry)
            File.open(file, "rb") do |io|
              zos << io.read
            end

          end

          zos.close
          tmp_zip.rewind

          Base64.encode64(tmp_zip.read)
        ensure
          tmp_zip.close
        end
      end

    end # Zipper
  end # WebDriver
end # Selenium
