require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Remote

      describe Bridge do
        it "raises ArgumentError if passed invalid options" do
          lambda { Bridge.new(:foo => 'bar') }.should raise_error(ArgumentError)
        end

        it "raises WebDriverError if uploading non-files" do
          request_body = WebDriver.json_dump(:sessionId => '11123', :value => {})
          headers = {'Content-Type' => 'application/json'}
          stub_request(:post, "http://127.0.0.1:4444/wd/hub/session").to_return(
            :status => 200, :body => request_body, :headers => headers)

          bridge = Bridge.new
          lambda { bridge.upload("NotAFile")}.should raise_error(Error::WebDriverError)
        end
      end

    end # Remote
  end # WebDriver
end # Selenium

