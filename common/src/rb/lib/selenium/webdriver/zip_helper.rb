require 'zip/zip'

module Selenium
  module WebDriver

    module ZipHelper

      module_function

      def unzip(path)
        destination = Dir.mktmpdir("unzip")
        FileReaper << destination

        Zip::ZipFile.open(path) do |zip|
          zip.each do |entry|
            zip.extract(entry, File.join(destination, entry.name))
          end
        end

        destination
      end


    end # ZipHelper
  end # WebDriver
end # Selenium
