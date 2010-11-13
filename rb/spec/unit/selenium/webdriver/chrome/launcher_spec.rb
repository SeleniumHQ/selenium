require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Chrome

      describe Launcher do
        let(:mock_process) do
          mock("ChildProcess", :io => mock.as_null_object, :start => true)
        end

        it "uses the user-provided path if set" do
          Platform.stub!(:assert_executable).with("/some/path")
          Chrome.path = "/some/path"

          ChildProcess.should_receive(:build).
                       with { |*args| args.first.should == "/some/path" }.
                       and_return(mock_process)

          Launcher.launcher.launch(nil)
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium


