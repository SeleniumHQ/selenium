require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Zipper do

      before do
        dir = Dir.mktmpdir("zipper")
        filename = File.join(dir, "file.txt")
        File.open(filename, "w") { |io| io << "content" }
        File.symlink(filename, File.join(dir, "link")) unless Platform.windows?

        @zip_file = File.join(Dir.tmpdir, "test.zip")
        File.open(@zip_file, "w") do |io|
          io << Base64.decode64(Zipper.zip(dir))
        end
      end

      after { FileUtils.rm_rf @zip_file if @zip_file }

      it "zips and unzips a folder" do
        unzipped = Zipper.unzip(@zip_file)
        File.read(File.join(unzipped, "file.txt")).should == "content"

        unless Platform.windows?
          File.read(File.join(unzipped, "link")).should == "content"
        end
      end

    end
  end
end
