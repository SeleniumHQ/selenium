require 'zip/zip'
require 'fileutils'
require 'find'
require 'base64'

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
        temp_file = "#{Dir.mktmpdir}/webdriver-profile.zip"

        begin
          Zip::ZipFile.open(temp_file, Zip::ZipFile::CREATE) do |zip|
            ::Find.find(path) do |file|
              next if File.directory?(file)
              entry = file.sub("#{path}/", '')

              zip.add entry, file
            end
          end

          mem_buf = File.open(temp_file, "rb") { |io| io.read }
          Base64.encode64(mem_buf)
        ensure
          FileUtils.rm_rf temp_file
        end
      end

    end # Zipper
  end # WebDriver
end # Selenium
