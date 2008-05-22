require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/inspect'

class HashInspectTest < Test::Unit::TestCase
  
  def test_should_keep_spacing_between_key_value
    hash = {:a => true}
    assert_equal '{:a => true}', hash.mocha_inspect
  end
  
  def test_should_use_mocha_inspect_on_each_item
    hash = {:a => 'mocha'}
    assert_equal "{:a => 'mocha'}", hash.mocha_inspect
  end
  
end