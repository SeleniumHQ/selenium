$: << File.expand_path(File.dirname(__FILE__) + "/../../vendor/mocha-0.5.6/lib")
require File.expand_path(File.dirname(__FILE__) + "/../test_helper")
require File.expand_path(File.dirname(__FILE__) + "/../../vendor/mocha-0.5.6/lib/mocha")
require File.expand_path(File.dirname(__FILE__) + "/../../vendor/dust-0.1.6/lib/dust")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/rspec/reporting/file_path_strategy")

Test::Unit::TestCase.class_eval do
  
  def assert_true(result)
    assert_equal true, result
  end

  def assert_false(result)
    assert_equal false, result
  end
  
end
  