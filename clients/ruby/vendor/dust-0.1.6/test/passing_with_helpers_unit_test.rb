require File.expand_path(File.dirname(__FILE__) + "/test_helper")

Test::Unit::TestCase.disallow_helpers!
unit_tests :allow => [:helper, :helper2] do
  def helper
  end

  def helper2
  end
  
  test("true"){}
end
Test::Unit::TestCase.class_eval {  @disallow_helpers = nil }