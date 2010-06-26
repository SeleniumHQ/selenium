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
            to = File.join(destination, entry.name)
            FileUtils.mkdir_p File.dirname(to)

            zip.extract(entry, to)
          end
        end

        destination
      end


    end # ZipHelper
  end # WebDriver
end # Selenium
