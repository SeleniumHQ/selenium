module Mocha
  
  module ObjectMethods
    def __metaclass__
      class << self; self; end
    end
  end
  
end

class Object
  include Mocha::ObjectMethods
end