module Selenium
  module WebDriver
    describe Element do
      before do
        driver.file_detector = lambda { |str| __FILE__ }
      end

      after do
        driver.file_detector = nil
      end

      it "uses the file detector" do
        driver.navigate.to url_for("upload.html")

        driver.find_element(:id => "upload").send_keys("random string")
        driver.find_element(:id => "go").submit

        driver.switch_to.frame("upload_target")
        body = driver.find_element(:xpath => "//body")
        body.text.should include("uses the set file detector")
      end
    end
  end # WebDriver
end # Selenium
