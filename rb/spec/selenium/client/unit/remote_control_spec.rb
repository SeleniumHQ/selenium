require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::ServerControl do
  def mock_process
    @mock_process ||= mock("ChildProcess").as_null_object
  end

  it "returns the host provided in the contructor" do
    Selenium::Client::ServerControl.new(:the_host, :a_port).host.should == :the_host
  end

  it "returns the port provided in the contructor" do
    Selenium::Client::ServerControl.new(:a_host, :the_port).port.should == :the_port
  end

  it "returns the timeout provided in the contructor" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port, :timeout => :the_timeout)
    rc.timeout_in_seconds.should == :the_timeout
  end

  it "returns 2 minutes by default" do
    Selenium::Client::ServerControl.new(:a_host, :a_port).timeout_in_seconds.should == 2 * 60
  end

  it "returns the shutdown command provided in the contructor" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port,
             :shutdown_command => :the_shutdown_command)
    rc.shutdown_command.should == :the_shutdown_command
  end

  it "sets the shutdown_command shutDownSeleniumServer by default" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port)
    rc.shutdown_command.should == "shutDownSeleniumServer"
  end

  it "sets jar_file to nil by default" do
    Selenium::Client::ServerControl.new(:a_host, :a_port).jar_file.should be_nil
  end

  it "can set jar_file" do
    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    server.jar_file.should == :the_jar_file
  end

  it "has empty additional args by default" do
    Selenium::Client::ServerControl.new(:a_host, :a_port).additional_args.should == []
  end

  it "lets the user provide additional parameter to RC start" do
    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.additional_args = [:an_arg, :another_arg]
    server.additional_args.should == [:an_arg, :another_arg]
  end

  describe "#start" do
    it "launches remote control process with the given port and timeout" do
      ChildProcess.should_receive(:build).with('java', '-jar', 'the_jar_file', '-port', 'the_port', '-timeout', 'the_timeout').
        and_return(mock_process)

      server = Selenium::Client::ServerControl.new(:a_host, :the_port, :timeout => :the_timeout)
      server.jar_file = :the_jar_file


      server.start
    end

    it "launches the remote control with additional args when provided" do
      ChildProcess.should_receive(:build).with('java', '-jar', 'a_jar_file', '-port', 'a_port',
                                               '-timeout', 'a_timeout', 'an_arg', 'another_arg').
                                         and_return(mock_process)

      server = Selenium::Client::ServerControl.new(:a_host, :a_port, :timeout => :a_timeout)
      server.jar_file = :a_jar_file
      server.additional_args = [:an_arg, :another_arg]
      server.start
    end

    it "launches the remote control process in the foreground by default" do
      ChildProcess.should_receive(:build).and_return(mock_process)
      mock_process.should_receive(:detach=).with(false)

      server = Selenium::Client::ServerControl.new(:a_host, :the_port)
      server.jar_file = :the_jar_file
      server.start
    end

    it "launches the remote control process in the background when background option is true" do
      ChildProcess.should_receive(:build).and_return(mock_process)
      mock_process.should_receive(:detach=).with(true)

      server = Selenium::Client::ServerControl.new(:a_host, :the_port)
      server.jar_file = :the_jar_file
      server.start :background => true
    end
  end

  describe "#stop" do
    it "issues a shutDownSeleniumServer command on the right host and port" do
      server = Selenium::Client::ServerControl.new(:a_host, :a_port)
      Net::HTTP.should_receive(:get).with(:a_host, '/selenium-server/driver/?cmd=shutDownSeleniumServer', :a_port)
      server.stop
    end

    it "lets the user customize the shutdown command for backward compatibility" do
      server = Selenium::Client::ServerControl.new(:a_host, :a_port, :shutdown_command => "shutDown")
      Net::HTTP.should_receive(:get).with(:a_host, '/selenium-server/driver/?cmd=shutDown', :a_port)
      server.stop
    end
  end

  it "lets additional_args include selenium flag and path to firefox profile" do
    server = Selenium::Client::ServerControl.new(:a_host, :a_port, :firefox_profile => :a_path)
    server.firefox_profile.should == :a_path
  end
end
