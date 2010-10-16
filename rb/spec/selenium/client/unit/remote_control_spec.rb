require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::ServerControl do
  def mock_shell
    shell = mock(Selenium::Client::Shell)
    Selenium::Client::Shell.stub!(:new).and_return(shell)

    shell
  end

  it "host returns the host provided in the contructor" do
    Selenium::Client::ServerControl.new(:the_host, :a_port).host.should == :the_host
  end

  it "port returns the port provided in the contructor" do
    Selenium::Client::ServerControl.new(:a_host, :the_port).port.should == :the_port
  end

  it "timeout_in_seconds returns the timeout provided in the contructor" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port, :timeout => :the_timeout)
    rc.timeout_in_seconds.should == :the_timeout
  end

  it "timeout_in_seconds returns 2 minutes by default" do
    Selenium::Client::ServerControl.new(:a_host, :a_port).timeout_in_seconds.should == 2 * 60
  end

  it "shutdown_command returns the command provided in the contructor" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port,
             :shutdown_command => :the_shutdown_command)
    rc.shutdown_command.should == :the_shutdown_command
  end

  it "shutdown_command returns shutDownSeleniumServer by default" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port)
    rc.shutdown_command.should == "shutDownSeleniumServer"
  end

  it "jar_file is nil by default" do
    Selenium::Client::ServerControl.new(:a_host, :a_port).jar_file.should be_nil
  end

  it "jar_file can be set" do
    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    server.jar_file.should == :the_jar_file
  end

  it "additional_args is empty by default" do
    Selenium::Client::ServerControl.new(:a_host, :a_port).additional_args.should == []
  end

  it "additional_args can be set to provide additional parameter on RC start" do
    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.additional_args = [:an_arg, :another_arg]
    server.additional_args.should == [:an_arg, :another_arg]
  end

  it "start launches the remote control process with the right port and timeout" do
    mock_shell.should_receive(:run).with('java -jar "the_jar_file" -port the_port -timeout the_timeout', anything)

    server = Selenium::Client::ServerControl.new(:a_host, :the_port, :timeout => :the_timeout)
    server.jar_file = :the_jar_file


    server.start
  end

  it "start launches the remote control with additional args when provided" do
    mock_shell.should_receive(:run).with('java -jar "a_jar_file" -port a_port -timeout a_timeout an_arg another_arg', anything)

    server = Selenium::Client::ServerControl.new(:a_host, :a_port, :timeout => :a_timeout)
    server.jar_file = :a_jar_file
    server.additional_args = [:an_arg, :another_arg]
    server.start
  end

  it "start does not launch the remote control process in the background by default" do
    mock_shell.should_receive(:run).with(anything, { :nohup => nil, :background => nil })

    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    server.start
  end

  it "start launches the remote control process in the background when background option is true" do
    mock_shell.should_receive(:run).with(anything, { :nohup => nil, :background => true })

    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    server.start :background => true
  end

  it "start launches the remote control process with nohup if the nohup option is set" do
    mock_shell.should_receive(:run).with(anything, { :nohup => '1', :background => true })

    server = Selenium::Client::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    server.start :background => true, :nohup => '1'
  end

  it "stop issues a shutDownSeleniumServer command on the right host and post" do
    server = Selenium::Client::ServerControl.new(:a_host, :a_port)
    Net::HTTP.should_receive(:get).with(:a_host, '/selenium-server/driver/?cmd=shutDownSeleniumServer', :a_port)
    server.stop
  end

  it "Shutdown command can be customized for backward compatibility" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port, :shutdown_command => "shutDown")
    Net::HTTP.should_receive(:get).with(:a_host, '/selenium-server/driver/?cmd=shutDown', :a_port)
    rc.stop
  end

  it "additional_args includes selenium flag and path to firefox profile" do
    rc = Selenium::Client::ServerControl.new(:a_host, :a_port, :firefox_profile => :a_path)
    rc.firefox_profile.should == :a_path
  end

end
