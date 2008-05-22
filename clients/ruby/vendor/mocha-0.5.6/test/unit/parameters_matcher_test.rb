require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/parameters_matcher'

class ParametersMatcherTest < Test::Unit::TestCase
  
  include Mocha

  def test_should_match_any_actual_parameters_if_no_expected_parameters_specified
    parameters_matcher = ParametersMatcher.new
    assert parameters_matcher.match?(actual_parameters = [1, 2, 3])
  end

  def test_should_match_if_actual_parameters_are_same_as_expected_parameters
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, 6])
    assert parameters_matcher.match?(actual_parameters = [4, 5, 6])
  end
  
  def test_should_not_match_if_actual_parameters_are_different_from_expected_parameters
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, 6])
    assert !parameters_matcher.match?(actual_parameters = [1, 2, 3])
  end
  
  def test_should_not_match_if_there_are_less_actual_parameters_than_expected_parameters
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, 6])
    assert !parameters_matcher.match?(actual_parameters = [4, 5])
  end
  
  def test_should_not_match_if_there_are_more_actual_parameters_than_expected_parameters
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5])
    assert !parameters_matcher.match?(actual_parameters = [4, 5, 6])
  end
  
  def test_should_not_match_if_not_all_required_parameters_are_supplied
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert !parameters_matcher.match?(actual_parameters = [4])
  end
  
  def test_should_match_if_all_required_parameters_match_and_no_optional_parameters_are_supplied
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert parameters_matcher.match?(actual_parameters = [4, 5])
  end
  
  def test_should_match_if_all_required_and_optional_parameters_match_and_some_optional_parameters_are_supplied
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert parameters_matcher.match?(actual_parameters = [4, 5, 6])
  end
  
  def test_should_match_if_all_required_and_optional_parameters_match_and_all_optional_parameters_are_supplied
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert parameters_matcher.match?(actual_parameters = [4, 5, 6, 7])
  end
  
  def test_should_not_match_if_all_required_and_optional_parameters_match_but_too_many_optional_parameters_are_supplied
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert !parameters_matcher.match?(actual_parameters = [4, 5, 6, 7, 8])
  end
  
  def test_should_not_match_if_all_required_parameters_match_but_some_optional_parameters_do_not_match
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert !parameters_matcher.match?(actual_parameters = [4, 5, 6, 0])
  end

  def test_should_not_match_if_some_required_parameters_do_not_match_although_all_optional_parameters_do_match
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert !parameters_matcher.match?(actual_parameters = [4, 0, 6])
  end

  def test_should_not_match_if_all_required_parameters_match_but_no_optional_parameters_match
    optionals = ParameterMatchers::Optionally.new(6, 7)
    parameters_matcher = ParametersMatcher.new(expected_parameters = [4, 5, optionals])
    assert !parameters_matcher.match?(actual_parameters = [4, 5, 0, 0])
  end

  def test_should_match_if_actual_parameters_satisfy_matching_block
    parameters_matcher = ParametersMatcher.new { |x, y| x + y == 3 }
    assert parameters_matcher.match?(actual_parameters = [1, 2])
  end

  def test_should_not_match_if_actual_parameters_do_not_satisfy_matching_block
    parameters_matcher = ParametersMatcher.new { |x, y| x + y == 3 }
    assert !parameters_matcher.match?(actual_parameters = [2, 3])
  end
  
  def test_should_remove_outer_array_braces
    params = [1, 2, [3, 4]]
    parameters_matcher = ParametersMatcher.new(params)
    assert_equal '(1, 2, [3, 4])', parameters_matcher.mocha_inspect
  end
  
  def test_should_display_numeric_arguments_as_is
    params = [1, 2, 3]
    parameters_matcher = ParametersMatcher.new(params)
    assert_equal '(1, 2, 3)', parameters_matcher.mocha_inspect
  end
  
  def test_should_remove_curly_braces_if_hash_is_only_argument
    params = [{:a => 1, :z => 2}]
    parameters_matcher = ParametersMatcher.new(params)
    assert_nil parameters_matcher.mocha_inspect.index('{')
    assert_nil parameters_matcher.mocha_inspect.index('}')
  end
  
  def test_should_not_remove_curly_braces_if_hash_is_not_the_only_argument
    params = [1, {:a => 1}]
    parameters_matcher = ParametersMatcher.new(params)
    assert_equal '(1, {:a => 1})', parameters_matcher.mocha_inspect
  end
  
  def test_should_indicate_that_matcher_will_match_any_actual_parameters
    parameters_matcher = ParametersMatcher.new
    assert_equal '(any_parameters)', parameters_matcher.mocha_inspect
  end

end