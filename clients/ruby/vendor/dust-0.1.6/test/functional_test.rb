require File.expand_path(File.dirname(__FILE__) + "/test_helper")

functional_tests do
  test "assert true" do
    assert_equal true, true
  end
  
  test "class name is Functionals::FunctionalTest" do
    assert_equal "Functionals::FunctionalTest", self.class.name
  end

end