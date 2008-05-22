require File.expand_path(File.dirname(__FILE__) + "/test_helper")

Test::Unit::TestCase.disallow_helpers!
unit_tests :allow => :helper do
  def helper
  end
  
  test("true"){}
end
Test::Unit::TestCase.class_eval {  @disallow_helpers = nil }