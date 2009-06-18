require File.join(File.dirname(__FILE__), "..", "test_helper")

require 'mocha/exception_raiser'
require 'timeout'

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
  
  def test_should_raise_exception_instance
    exception_class = Class.new(StandardError)
    raiser = ExceptionRaiser.new(exception_class.new('message'), nil)
    exception = assert_raises(exception_class) { raiser.evaluate }
    assert_equal 'message', exception.message
  end
  
  def test_should_raise_interrupt_exception_with_default_message_so_it_works_in_ruby_1_8_6
    raiser = ExceptionRaiser.new(Interrupt, nil)
    assert_raises(Interrupt) { raiser.evaluate }
  end

  def test_should_raise_subclass_of_interrupt_exception_with_default_message_so_it_works_in_ruby_1_8_6
    exception_class = Class.new(Interrupt)
    raiser = ExceptionRaiser.new(exception_class, nil)
    assert_raises(exception_class) { raiser.evaluate }
  end

end