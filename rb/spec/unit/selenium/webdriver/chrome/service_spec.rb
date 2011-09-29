require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Chrome

      describe Service do
        let(:mock_process) do
          mock("ChildProcess", :io => mock.as_null_object, :start => true)
        end

        # ugh.
        before { Service.instance_variable_set("@executable_path", nil) }

        it "uses the user-provided path if set" do
          Platform.stub!(:os => :unix)
          Platform.stub!(:assert_executable).with("/some/path")
          Chrome.driver_path = "/some/path"

          ChildProcess.should_receive(:build).
                       with { |*args| args.first.should == "/some/path" }.
                       and_return(mock_process)

          Service.default_service
        end

        it "finds the Chrome server binary by searching PATH" do
          Platform.stub!(:os => :unix)
          Platform.should_receive(:find_binary).once.and_return("/some/path")
          Platform.should_receive(:assert_executable).with("/some/path")

          Service.executable_path.should == "/some/path"
        end

        it "raises a nice error if the server binary can't be found" do
          Platform.stub!(:find_binary).and_return(nil)

          lambda { Service.executable_path }.should raise_error(Error::WebDriverError, /code\.google\.com/)
        end

      end
    end # Chrome
  end # WebDriver
end # Selenium
