require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "host returns the host provided in the contructor" do
    assert_equal :the_host, Selenium::ServerControl::ServerControl.new(:the_host, :a_port).host
  end

  test "port returns the port provided in the contructor" do
    assert_equal :the_port, Selenium::ServerControl::ServerControl.new(:a_host, :the_port).port
  end

  test "timeout_in_seconds returns the timeout provided in the contructor" do
    rc = Selenium::ServerControl::ServerControl.new(:a_host, :a_port, :timeout => :the_timeout)
    assert_equal :the_timeout, rc.timeout_in_seconds
  end

  test "timeout_in_seconds returns 2 minutes by default" do
    assert_equal 2 * 60, 
                 Selenium::ServerControl::ServerControl.new(:a_host, :a_port).timeout_in_seconds
  end

  test "shutdown_command returns the command provided in the contructor" do
    rc = Selenium::ServerControl::ServerControl.new(:a_host, :a_port, 
             :shutdown_command => :the_shutdown_command)
    assert_equal :the_shutdown_command, rc.shutdown_command
  end

  test "shutdown_command returns shutDownSeleniumServer by default" do
    rc = Selenium::ServerControl::ServerControl.new(:a_host, :a_port) 
    assert_equal "shutDownSeleniumServer", rc.shutdown_command
  end
  
  test "jar_file is nil by default" do
    assert_nil Selenium::ServerControl::ServerControl.new(:a_host, :a_port).jar_file
  end

  test "jar_file can be set" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    assert_equal :the_jar_file, server.jar_file
  end

  test "additional_args is empty by default" do
    assert_equal [], Selenium::ServerControl::ServerControl.new(:a_host, :a_port).additional_args
  end

  test "additional_args can be set to provide additional parameter on RC start" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :the_port)
    server.additional_args = [:an_arg, :another_arg]
    assert_equal [:an_arg, :another_arg], server.additional_args
  end
  
  test "start launches the remote control process with the right port and timeout" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :the_port, :timeout => :the_timeout)
    server.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with('java -jar "the_jar_file" -port the_port -timeout the_timeout', anything)
    server.start
  end

  test "start launches the remote control with additional args when provided" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :a_port, :timeout => :a_timeout)
    server.jar_file = :a_jar_file
    server.additional_args = [:an_arg, :another_arg]
    Nautilus::Shell.any_instance.expects(:run).with('java -jar "a_jar_file" -port a_port -timeout a_timeout an_arg another_arg', anything)
    server.start
  end

  test "start does not launch the remote control process in the background by default" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with(anything, { :nohup => nil, :background => nil })
    server.start
  end

  test "start launches the remote control process in the background when background option is true" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with(anything, { :nohup => nil, :background => true })
    server.start :background => true
  end

  test "start launches the remote control process with nohup if the nohup option is set" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :the_port)
    server.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with(anything, { :nohup => '1', :background => true })
    server.start :background => true, :nohup => '1'
  end

  test "stop issues a shutDownSeleniumServer command on the right host and post" do
    server = Selenium::ServerControl::ServerControl.new(:a_host, :a_port)
    Net::HTTP.expects(:get).with(:a_host, '/selenium-server/driver/?cmd=shutDownSeleniumServer', :a_port)
    server.stop
  end

  test "Shutdown command can be customized for backward compatibility" do
    rc = Selenium::ServerControl::ServerControl.new(:a_host, :a_port, :shutdown_command => "shutDown")
    Net::HTTP.expects(:get).with(:a_host, '/selenium-server/driver/?cmd=shutDown', :a_port)
    rc.stop
  end
  
  test "additional_args includes selenium flag and path to firefox profile" do
    rc = Selenium::ServerControl::ServerControl.new(:a_host, :a_port, :firefox_profile => :a_path)
    assert_equal :a_path, rc.firefox_profile
  end
  
end
