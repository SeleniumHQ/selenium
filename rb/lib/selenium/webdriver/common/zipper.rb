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
        tmp_zip = Tempfile.new("webdriver-zip")

        begin
          zos = Zip::ZipOutputStream.new(tmp_zip.path)

          ::Find.find(path) do |file|
            next if File.directory?(file)
            entry = file.sub("#{path}/", '')

            zos.put_next_entry(entry)
            zos << File.read(file)
            p :added => file, :as => entry
          end

          zos.close
          tmp_zip.rewind

          [tmp_zip.read].pack("m")
        ensure
          tmp_zip.close
        end
      end

    end # Zipper
  end # WebDriver
end # Selenium
