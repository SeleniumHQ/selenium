require 'mocha/mock'
require 'mocha/instance_method'
require 'mocha/class_method'
require 'mocha/any_instance_method'

# Methods added all objects to allow mocking and stubbing on real objects.
#
# Methods return a Mocha::Expectation which can be further modified by methods on Mocha::Expectation.
class Object
  
  def mocha # :nodoc:
    @mocha ||= Mocha::Mock.new
  end
  
  def reset_mocha # :nodoc:
    @mocha = nil
  end
  
  def stubba_method # :nodoc:
    Mocha::InstanceMethod
  end
  
  def stubba_object # :nodoc:
    self
  end
  
  # :call-seq: expects(symbol) -> expectation
  #
  # Adds an expectation that a method identified by +symbol+ must be called exactly once with any parameters.
  # Returns the new expectation which can be further modified by methods on Mocha::Expectation.
  #   product = Product.new
  #   product.expects(:save).returns(true)
  #   assert_equal false, product.save
  #
  # The original implementation of <tt>Product#save</tt> is replaced temporarily.
  #
  # The original implementation of <tt>Product#save</tt> is restored at the end of the test.
  def expects(symbol) 
    method = stubba_method.new(stubba_object, symbol)
    $stubba.stub(method)
    mocha.expects(symbol, caller)
  end
  
  # :call-seq: stubs(symbol) -> expectation
  #
  # Adds an expectation that a method identified by +symbol+ may be called any number of times with any parameters.
  # Returns the new expectation which can be further modified by methods on Mocha::Expectation.
  #   product = Product.new
  #   product.stubs(:save).returns(true)
  #   assert_equal false, product.save
  #
  # The original implementation of <tt>Product#save</tt> is replaced temporarily.
  #
  # The original implementation of <tt>Product#save</tt> is restored at the end of the test.
  def stubs(symbol) 
    method = stubba_method.new(stubba_object, symbol)
    $stubba.stub(method)
    mocha.stubs(symbol, caller)
  end
  
  def verify # :nodoc:
    mocha.verify
  end
  
end

class Module # :nodoc:
  
  def stubba_method
    Mocha::ClassMethod
  end
    
end
  
class Class
  
  def stubba_method # :nodoc:
    Mocha::ClassMethod
  end

  class AnyInstance # :nodoc:
    
    def initialize(klass)
      @stubba_object = klass
    end
    
    def stubba_method
      Mocha::AnyInstanceMethod
    end
    
    def stubba_object
      @stubba_object
    end
    
  end
  
  # :call-seq: any_instance -> mock object
  #
  # Returns a mock object which will detect calls to any instance of this class.
  #   Product.any_instance.stubs(:save).returns(false)
  #   product_1 = Product.new
  #   assert_equal false, product_1.save
  #   product_2 = Product.new
  #   assert_equal false, product_2.save
  def any_instance
    @any_instance ||= AnyInstance.new(self)
  end
  
end

