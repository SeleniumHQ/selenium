require 'test/unit'
require 'rubygems'
require 'mocha'

class MiscExampleTest < Test::Unit::TestCase
  
  def test_mocking_a_class_method
    product = Product.new
    Product.expects(:find).with(1).returns(product)
    assert_equal product, Product.find(1)
  end

  def test_mocking_an_instance_method_on_a_real_object
    product = Product.new
    product.expects(:save).returns(true)
    assert product.save
  end

  def test_stubbing_instance_methods_on_real_objects
    prices = [stub(:pence => 1000), stub(:pence => 2000)]
    product = Product.new
    product.stubs(:prices).returns(prices)
    assert_equal [1000, 2000], product.prices.collect {|p| p.pence}
  end

  def test_stubbing_an_instance_method_on_all_instances_of_a_class
    Product.any_instance.stubs(:name).returns('stubbed_name')
    product = Product.new
    assert_equal 'stubbed_name', product.name
  end

  def test_traditional_mocking
    object = mock()
    object.expects(:expected_method).with(:p1, :p2).returns(:result)
    assert_equal :result, object.expected_method(:p1, :p2)
  end

  def test_shortcuts
    object = stub(:method1 => :result1, :method2 => :result2)
    assert_equal :result1, object.method1
    assert_equal :result2, object.method2
  end
  
end