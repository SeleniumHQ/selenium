require File.expand_path("../../webdriver/spec_helper", __FILE__)
require 'selenium/rake/server_task'

describe Selenium::Rake::ServerTask do
  let(:mock_server) { mock(Selenium::Server).as_null_object }

  it "raises an error if no jar file is specified" do
    lambda {
      Selenium::Rake::ServerTask.new
    }.should raise_error(Selenium::Rake::MissingJarFileError)
  end

  it "launches the server with default options" do
    expected_opts = {
      :port       => 4444,
      :timeout    => 30,
      :background => true,
      :log        => true,
    }

    Selenium::Server.should_receive(:new).
                     with("selenium-server.jar", expected_opts).
                     and_return(mock_server)

    task = Selenium::Rake::ServerTask.new { |t| t.jar = "selenium-server.jar" }

    task.port.should == 4444
    task.timeout.should == 30
    task.background.should be_true
    task.log.should be_true
    task.opts.should == []
  end

  it "lets the user override the default options" do
    expected_opts = {
      :port       => 5555,
      :timeout    => 120,
      :background => false,
      :log        => false,
    }

    Selenium::Server.should_receive(:new).
                     with("selenium-server.jar", expected_opts).
                     and_return(mock_server)

    task = Selenium::Rake::ServerTask.new { |t|
      t.jar        = "selenium-server.jar"
      t.port       = 5555
      t.timeout    = 120
      t.background = false
      t.log        = false

      t.opts << "-some" << "args"
    }

    task.port.should == 5555
    task.timeout.should == 120
    task.background.should be_false
    task.log.should be_false
    task.opts.should == ["-some", "args"]
  end

  it "lets the user specify a version to use which it will automatically download" do
    required_version = '10.2.0'
    jar_file = "selenium-server-standalone-#{required_version}.jar"

    Selenium::Server.should_receive(:new).
                     with(jar_file, anything()).
                     and_return(mock_server)

    Selenium::Server.should_receive(:download).
                     with(required_version).
                     and_return(jar_file)

    Selenium::Rake::ServerTask.new { |t| t.version = required_version }
  end


end
