require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Chrome

      describe Launcher do
        let(:mock_process) do
          mock("ChildProcess", :io => mock.as_null_object, :start => true)
        end

        before { Launcher.instance_variable_set("@binary_path", nil) }

        it "uses the user-provided path if set" do
          Platform.stub!(:assert_executable).with("/some/path")
          Chrome.path = "/some/path"

          ChildProcess.should_receive(:build).
          with { |*args| args.first.should == "/some/path" }.
          and_return(mock_process)

          Launcher.new.launch(nil)
        end

        it "finds the Chrome binary on *nix" do
          Platform.stub!(:os => :unix)
          Platform.should_receive(:find_binary).any_number_of_times.and_return("/some/path")
          File.should_receive(:exist?).with("/some/path").and_return(true)

          Launcher.binary_path.should == "/some/path"
        end

        it "finds the Chrome binary on Windows" do
          Platform.stub!(:os => :windows)
          Launcher.stub!(:windows_registry_path => "/some/path")
          File.should_receive(:exist?).with("/some/path").and_return(true)

          Launcher.binary_path.should == "/some/path"
        end

        it "finds the Chrome binary on OS X" do
          Platform.stub!(:os => :unix)
          File.should_receive(:exist?).with(instance_of(String)).and_return(true)

          Launcher.binary_path.should be_kind_of(String)
        end

      end
    end # Chrome
  end # WebDriver
end # Selenium
