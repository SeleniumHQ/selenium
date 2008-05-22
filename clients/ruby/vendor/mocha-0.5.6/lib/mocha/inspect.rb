require 'date'

class Object
  def mocha_inspect
    address = self.__id__ * 2
    address += 0x100000000 if address < 0
    inspect =~ /#</ ? "#<#{self.class}:0x#{'%x' % address}>" : inspect
  end
end

class String
  def mocha_inspect
    inspect.gsub(/\"/, "'")
  end
end

class Array
  def mocha_inspect
    "[#{collect { |member| member.mocha_inspect }.join(', ')}]"
  end
end

class Hash
  def mocha_inspect
    "{#{collect { |key, value| "#{key.mocha_inspect} => #{value.mocha_inspect}" }.join(', ')}}"
  end
end

class Time
  def mocha_inspect
    "#{inspect} (#{to_f} secs)"
  end
end

class Date
  def mocha_inspect
    to_s
  end
end