class Range
  
  def self.at_least(minimum_value)
    Range.new(minimum_value, infinite)
  end
  
  def self.at_most(maximum_value)
    Range.new(-infinite, maximum_value, false)
  end
  
  def self.infinite
    1/0.0
  end
  
  def mocha_inspect
    if first.respond_to?(:to_f) and first.to_f.infinite? then
      return "at most #{last}"
    elsif last.respond_to?(:to_f) and last.to_f.infinite? then
      return "at least #{first}"
    else
      to_s
    end
  end
  
end