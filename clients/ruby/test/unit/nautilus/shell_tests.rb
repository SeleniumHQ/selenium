require File.expand_path(File.dirname(__FILE__) + '/../unit_test_helper')

unit_tests do
  
  test "run executes a shell command" do
    shell = Nautilus::Shell.new
    shell.stubs(:build_command).with(:a_command, :some_options).returns(:actual_command)
    shell.expects(:sh).with(:actual_command)
    shell.run :a_command, :some_options
  end

  test "build_command returns the command itself when command is a string and no options are provided" do
    shell = Nautilus::Shell.new
    shell.stubs(:windows?).returns(false)
    assert_equal "a command", shell.build_command("a command")
  end
  
  test "build_command appends amperand when command is run on the background on non windows platforms" do
    shell = Nautilus::Shell.new
    shell.stubs(:windows?).returns(false)
    assert_equal "a command &", 
                 shell.build_command("a command", :background => true)
  end
  
  test "build_command prepend start when command is run on the background on non windows platforms" do
    shell = Nautilus::Shell.new
    shell.stubs(:windows?).returns(true)
    assert_equal "start /wait /b a command", 
                 shell.build_command("a command", :background => true)
  end
  
  test "build_command command can be specified as an array" do
    shell = Nautilus::Shell.new
    assert_equal "a_command an_option an_argument",
                 shell.build_command(["a_command", "an_option", "an_argument"])
  end
  
  test "sh executes a system command" do
    shell = Nautilus::Shell.new
    shell.expects(:system).with("a command").returns(true)
    shell.sh "a command"    
  end
  
  test "run raises and exception when system command fails" do
    shell = Nautilus::Shell.new
    shell.expects(:system).with("a command").returns(false)
    assert_raise RuntimeError do 
      shell.sh "a command"
    end
  end
    
end
