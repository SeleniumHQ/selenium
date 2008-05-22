require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/instance_of'
require 'mocha/inspect'

class InstanceOfTest < Test::Unit::TestCase

  include Mocha::ParameterMatchers

  def test_should_match_object_that_is_an_instance_of_specified_class
    matcher = instance_of(String)
    assert matcher.matches?(['string'])
  end

  def test_should_not_match_object_that_is_not_an_instance_of_specified_class
    matcher = instance_of(String)
    assert !matcher.matches?([99])
  end

  def test_should_describe_matcher
    matcher = instance_of(String)
    assert_equal "instance_of(String)", matcher.mocha_inspect
  end

end
