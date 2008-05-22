require File.expand_path(File.dirname(__FILE__) + "/test_helper")

begin
  unit_tests do
    Test::Unit::TestCase.disallow_helpers!
    def helper_method
    end
    
    test("true"){}
  end
  raise "shouldn't be here"
rescue Dust::DefinitionError => ex
  raise unless ex.message == "helper methods are not allowed on class Units::FailingWithHelperUnitTest"
ensure
  Test::Unit::TestCase.class_eval {  @disallow_helpers = nil }
end