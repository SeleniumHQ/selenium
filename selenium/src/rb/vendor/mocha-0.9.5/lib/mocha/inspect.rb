require 'date'

module Mocha
  
  module ObjectMethods
    def mocha_inspect
      address = self.__id__ * 2
      address += 0x100000000 if address < 0
      inspect =~ /#</ ? "#<#{self.class}:0x#{'%x' % address}>" : inspect
    end
  end
  
  module StringMethods
    def mocha_inspect
      inspect.gsub(/\"/, "'")
    end
  end
  
  module ArrayMethods
    def mocha_inspect
      "[#{collect { |member| member.mocha_inspect }.join(', ')}]"
    end
  end
  
  module HashMethods
    def mocha_inspect
      "{#{collect { |key, value| "#{key.mocha_inspect} => #{value.mocha_inspect}" }.join(', ')}}"
    end
  end
  
  module TimeMethods
    def mocha_inspect
      "#{inspect} (#{to_f} secs)"
    end
  end
  
  module DateMethods
    def mocha_inspect
      to_s
    end
  end
  
end

class Object
  include Mocha::ObjectMethods
end

class String
  include Mocha::StringMethods
end

class Array
  include Mocha::ArrayMethods
end

class Hash
  include Mocha::HashMethods
end

class Time
  include Mocha::TimeMethods
end

class Date
  include Mocha::DateMethods
end