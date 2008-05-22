require File.expand_path(File.dirname(__FILE__) + "/test_helper")

begin
  unit_tests do
    Test::Unit::TestCase.disallow_setup!
    def setup
    end
    
    test("true"){}
  end
  raise "shouldn't be here"
rescue Dust::DefinitionError => ex
  raise unless ex.message == "setup is not allowed on class Units::FailingWithSetupUnitTest"
ensure
  Test::Unit::TestCase.class_eval {  @disallow_setup = nil }
end