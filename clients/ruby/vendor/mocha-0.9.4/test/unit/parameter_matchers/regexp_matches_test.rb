require File.join(File.dirname(__FILE__), "..", "..", "test_helper")

require 'mocha/parameter_matchers/regexp_matches'
require 'mocha/inspect'

class RegexpMatchesTest < Test::Unit::TestCase
  
  include Mocha::ParameterMatchers
  
  def test_should_match_parameter_matching_regular_expression
    matcher = regexp_matches(/oo/)
    assert matcher.matches?(['foo'])
  end
  
  def test_should_not_match_parameter_not_matching_regular_expression
    matcher = regexp_matches(/oo/)
    assert !matcher.matches?(['bar'])
  end
  
  def test_should_describe_matcher
    matcher = regexp_matches(/oo/)
    assert_equal "regexp_matches(/oo/)", matcher.mocha_inspect
  end
  
end