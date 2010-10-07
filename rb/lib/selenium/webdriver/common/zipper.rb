require 'zip/zip'

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


    end # Zipper
  end # WebDriver
end # Selenium
