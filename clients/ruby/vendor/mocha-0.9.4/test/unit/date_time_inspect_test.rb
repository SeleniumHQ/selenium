require File.join(File.dirname(__FILE__), "..", "test_helper")
require 'mocha/inspect'

class DateTimeInspectTest < Test::Unit::TestCase
  
  def test_should_use_include_date_in_seconds
    time = Time.now
    assert_equal "#{time.inspect} (#{time.to_f} secs)", time.mocha_inspect
  end
  
  def test_should_use_to_s_for_date
    date = Date.new(2006, 1, 1)
    assert_equal date.to_s, date.mocha_inspect
  end
  
  def test_should_use_to_s_for_datetime
    datetime = DateTime.new(2006, 1, 1)
    assert_equal datetime.to_s, datetime.mocha_inspect
  end
  
end
