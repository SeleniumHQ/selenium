require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Zipper do

      #
      # TODO: clean this spec up
      #

      let(:base_file_name) { "file.txt" }
      let(:file_content)   { "content" }
      let(:zip_file)       { File.join(Dir.tmpdir, "test.zip") }
      let(:dir_to_zip)     { Dir.mktmpdir("webdriver-spec-zipper") }

      def create_file
        filename = File.join(dir_to_zip, base_file_name)
        File.open(filename, "w") { |io| io << file_content }

        filename
      end

      after {
        FileUtils.rm_rf zip_file
      }

      it "zips and unzips a folder" do
        create_file

        File.open(zip_file, "wb") do |io|
          io << Base64.decode64(Zipper.zip(dir_to_zip))
        end

        unzipped = Zipper.unzip(zip_file)
        File.read(File.join(unzipped, base_file_name)).should == file_content
      end

      it "zips and unzips a single file" do
        file_to_zip = create_file

        File.open(zip_file, "wb") do |io|
          io << Base64.decode64(Zipper.zip_file(file_to_zip))
        end

        unzipped = Zipper.unzip(zip_file)
        File.read(File.join(unzipped, base_file_name)).should == file_content
      end

      not_compliant_on :platform => :windows do
        it "follows symlinks when zipping" do
          filename = create_file
          File.symlink(filename, File.join(dir_to_zip, "link"))

          zip_file = File.join(Dir.tmpdir, "test.zip")
          File.open(zip_file, "wb") do |io|
            io << Base64.decode64(Zipper.zip(dir_to_zip))
          end

          unzipped = Zipper.unzip(zip_file)
          File.read(File.join(unzipped, "link")).should == file_content
        end
      end

    end
  end
end
