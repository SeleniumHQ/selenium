require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/yaml_equivalent'
require 'mocha/inspect'

class YamlEquivalentTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_parameter_matching_yaml_representation_of_object
    matcher = yaml_equivalent([1, 2, 3])
    assert matcher.matches?(["--- \n- 1\n- 2\n- 3\n"])
  end
  
  def test_should_not_match_parameter_matching_yaml_representation_of_object
    matcher = yaml_equivalent([1, 2, 3])
    assert !matcher.matches?(["--- \n- 4\n- 5\n"])
  end
  
  def test_should_describe_matcher
    matcher = yaml_equivalent([1, 2, 3])
    assert_equal "yaml_equivalent([1, 2, 3])", matcher.mocha_inspect
  end
  
end