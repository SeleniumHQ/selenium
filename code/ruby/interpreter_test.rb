require 'test/unit'
require 'selenium'
include Selenium

class CommandTranslationTest < Test::Unit::TestCase
  def teardown
    assert_equal(@wire_command, translate_method_to_wire_command(@method))
  end    
  def test_simple_commands_should_be_the_same
    @method = 'simple'
    @wire_command = @method
  end
  def test_leading_underscores_should_be_removed
    @method = '__send'
    @wire_command = 'send'
  end
  def test_intermediate_underscore_drops_and_caps_next
    @method = 'foo_bar'
    @wire_command = 'fooBar'
  end
  def test_with_two_intermediate_underscores
    @method = 'verify_title_today'
    @wire_command = 'verifyTitleToday'
  end
end    