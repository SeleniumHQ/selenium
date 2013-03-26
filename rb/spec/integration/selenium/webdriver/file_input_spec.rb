require File.expand_path("../spec_helper", __FILE__)

module Selenium::WebDriver::Support
  describe FileInput do

    compliant_on :driver => [:firefox] do
      it "should attach a single file" do
        driver.navigate.to url_for("formPage.html")
        element = driver.find_element(:id, "upload")
        file_input = Selenium::WebDriver::Support::FileInput.new(element)
        tmp = Tempfile.new('file1')
        file_input.attach_files(tmp.path.to_s)
        get_attached_filenames(element).should == [Pathname.new(tmp.path).basename.to_s]
      end

      it "should attach multiple files" do
        driver.navigate.to url_for("formPage.html")
        files = [Tempfile.new('file1'), Tempfile.new('file2')]
        element = driver.find_element(:id, "multiple_upload")
        file_input = Selenium::WebDriver::Support::FileInput.new(element)
        file_input.attach_files(files)
        filenames = files.map { |f| Pathname.new(f.path).basename.to_s }
        get_attached_filenames(element).should == filenames
      end
      
      def get_attached_filenames(element)
        driver.execute_script('
          var results=[];
          for (var i=0; i<arguments[0].files.length; i++){
            results.push(arguments[0].files[i].name);
          }
          return results;', element)
      end
    end
  end
end

