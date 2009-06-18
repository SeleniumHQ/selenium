class Order

  attr_accessor :shipped_on

  def total_cost
    line_items.inject(0) { |total, line_item| total + line_item.price } + shipping_cost
  end

  def total_weight
    line_items.inject(0) { |total, line_item| total + line_item.weight }
  end

  def shipping_cost
    total_weight * 5 + 10
  end

  class << self

    def find_all
      # Database.connection.execute('select * from orders...
    end
  
    def number_shipped_since(date)
      find_all.select { |order| order.shipped_on > date }.length
    end

    def unshipped_value
      find_all.inject(0) { |total, order| order.shipped_on ? total : total + order.total_cost }
    end

  end

end

require 'test/unit'
require 'rubygems'
require 'mocha'

class OrderTest < Test::Unit::TestCase

  # illustrates stubbing instance method
  def test_should_calculate_shipping_cost_based_on_total_weight
    order = Order.new
    order.stubs(:total_weight).returns(10)
    assert_equal 60, order.shipping_cost
  end

  # illustrates stubbing class method
  def test_should_count_number_of_orders_shipped_after_specified_date
    now = Time.now; week_in_secs = 7 * 24 * 60 * 60
    order_1 = Order.new; order_1.shipped_on = now - 1 * week_in_secs
    order_2 = Order.new; order_2.shipped_on = now - 3 * week_in_secs
    Order.stubs(:find_all).returns([order_1, order_2])
    assert_equal 1, Order.number_shipped_since(now - 2 * week_in_secs)
  end

  # illustrates stubbing instance method for all instances of a class
  def test_should_calculate_value_of_unshipped_orders
    Order.stubs(:find_all).returns([Order.new, Order.new, Order.new])
    Order.any_instance.stubs(:shipped_on).returns(nil)
    Order.any_instance.stubs(:total_cost).returns(10)
    assert_equal 30, Order.unshipped_value
  end

end
