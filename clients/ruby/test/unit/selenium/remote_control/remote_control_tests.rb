require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "host returns the host provided in the contructor" do
    assert_equal :the_host, Selenium::RemoteControl::RemoteControl.new(:the_host, :a_port).host
  end

  test "port returns the port provided in the contructor" do
    assert_equal :the_port, Selenium::RemoteControl::RemoteControl.new(:a_host, :the_port).port
  end

  test "timeout_in_seconds returns the timeout provided in the contructor" do
    assert_equal :the_timeout, 
                 Selenium::RemoteControl::RemoteControl.new(:a_host, :a_port, :the_timeout).timeout_in_seconds
  end

  test "timeout_in_seconds returns 2 minutes by default" do
    assert_equal 2 * 60, 
                 Selenium::RemoteControl::RemoteControl.new(:a_host, :a_port).timeout_in_seconds
  end
  
  test "jar_file is nil by default" do
    assert_nil Selenium::RemoteControl::RemoteControl.new(:a_host, :a_port).jar_file
  end

  test "jar_file can be set" do
    remote_control = Selenium::RemoteControl::RemoteControl.new(:a_host, :the_port, :the_timeout)
    remote_control.jar_file = :the_jar_file
    assert_equal :the_jar_file, remote_control.jar_file
  end

  test "additional_args is empty by default" do
    assert_equal [], Selenium::RemoteControl::RemoteControl.new(:a_host, :a_port).additional_args
  end

  test "additional_args can be set to provide additional parameter on RC start" do
    remote_control = Selenium::RemoteControl::RemoteControl.new(:a_host, :the_port, :the_timeout)
    remote_control.additional_args = [:an_arg, :another_arg]
    assert_equal [:an_arg, :another_arg], remote_control.additional_args
  end
  
  test "start launches the remote control process with the right port and timeout" do
    remote_control = Selenium::RemoteControl::RemoteControl.new(:a_host, :the_port, :the_timeout)
    remote_control.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with('java -jar "the_jar_file" -port the_port -timeout the_timeout', anything)
    remote_control.start
  end

  test "start launches the remote control with additional args when provided" do
    remote_control = Selenium::RemoteControl::RemoteControl.new(:a_host, :a_port, :a_timeout)
    remote_control.jar_file = :a_jar_file
    remote_control.additional_args = [:an_arg, :another_arg]
    Nautilus::Shell.any_instance.expects(:run).with('java -jar "a_jar_file" -port a_port -timeout a_timeout an_arg another_arg', anything)
    remote_control.start
  end

  test "start does not launch the remote control process in the background by default" do
    remote_control = Selenium::RemoteControl::RemoteControl.new(:a_host, :the_port, :the_timeout)
    remote_control.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with(anything, :background => nil)
    remote_control.start
  end

  test "start launches the remote control process in the background when background option is true" do
    remote_control = Selenium::RemoteControl::RemoteControl.new(:a_host, :the_port, :the_timeout)
    remote_control.jar_file = :the_jar_file
    Nautilus::Shell.any_instance.expects(:run).with(anything, :background => true)
    remote_control.start :background => true
  end
    
end