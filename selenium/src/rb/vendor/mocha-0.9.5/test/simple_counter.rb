class SimpleCounter
  
  attr_reader :count
  
  def initialize
    @count = 0
  end
  
  def increment
    @count += 1
  end
  
end