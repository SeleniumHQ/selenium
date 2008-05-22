require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/exception_raiser'

class ExceptionRaiserTest < Test::Unit::TestCase
  
  include Mocha
  
  def test_should_raise_exception_with_specified_class_and_default_message
    exception_class = Class.new(StandardError)
    raiser = ExceptionRaiser.new(exception_class, nil)
    exception = assert_raises(exception_class) { raiser.evaluate }
    assert_equal exception_class.to_s, exception.message
  end

  def test_should_raise_exception_with_specified_class_and_message
    exception_class = Class.new(StandardError)
    raiser = ExceptionRaiser.new(exception_class, 'message')
    exception = assert_raises(exception_class) { raiser.evaluate }
    assert_equal 'message', exception.message
  end
  
  def test_should_raise_interrupt_exception_with_default_message_so_it_works_in_ruby_1_8_6
    raiser = ExceptionRaiser.new(Interrupt, nil)
    assert_raises(Interrupt) { raiser.evaluate }
  end

end