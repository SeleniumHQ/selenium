require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::Shell do
  
  it "run executes a shell command" do
    shell = Selenium::Client::Shell.new
    shell.stub!(:build_command).with(:a_command, :some_options).and_return(:actual_command)
    shell.should_receive(:sh).with(:actual_command)
    shell.run :a_command, :some_options
  end

  it "build_command returns the command itself when command is a string and no options are provided" do
    shell = Selenium::Client::Shell.new
    shell.stub!(:windows?).and_return(false)
    shell.build_command("a command").should == "a command"
  end
  
  it "build_command appends amperand when command is run on the background on non windows platforms" do
    shell = Selenium::Client::Shell.new
    shell.stub!(:windows?).and_return(false)
    shell.build_command("a command", :background => true).should == "a command &"
  end
  
  it "build_command prepend start when command is run on the background on non windows platforms" do
    shell = Selenium::Client::Shell.new
    shell.stub!(:windows?).and_return(true)
    shell.build_command("a command", :background => true).should == "start /wait /b a command"
  end
  
  it "build_command command can be specified as an array" do
    shell = Selenium::Client::Shell.new
    shell.build_command(["a_command", "an_option", "an_argument"]).should == "a_command an_option an_argument"
  end
  
  it "sh executes a system command" do
    shell = Selenium::Client::Shell.new
    shell.should_receive(:system).with("a command").and_return(true)
    shell.sh "a command"    
  end
  
  it "run raises and exception when system command fails" do
    shell = Selenium::Client::Shell.new
    shell.should_receive(:system).with("a command").and_return(false)
    lambda { shell.sh "a command" }.should raise_error(RuntimeError)
  end
    
end
