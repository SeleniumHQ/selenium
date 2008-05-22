require File.expand_path(File.dirname(__FILE__) + "/test_helper")

Test::Unit::TestCase.disallow_setup!
unit_tests :allow => :setup do
  def setup
  end
  
  test("true"){}
end
Test::Unit::TestCase.class_eval {  @disallow_setup = nil }