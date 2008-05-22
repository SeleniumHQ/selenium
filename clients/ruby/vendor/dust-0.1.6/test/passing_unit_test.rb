require File.expand_path(File.dirname(__FILE__) + "/test_helper")

unit_tests do
  test "assert true" do
    assert_equal true, true
  end
  
  test "class name is Units::PassingUnitTest" do
    assert_equal "Units::PassingUnitTest", self.class.name
  end
end