require 'rake_tasks/crazy_fun/build_grammar'

class OutputType
  attr_accessor :name
  attr_reader :args

  def initialize
    @args = {}
  end

  def push(value)
    if value.is_a? NameType
      @name = value.to_native
    elsif value.is_a? ArgType
      @args[value.key] = value.value
    end
  end

  def [](key)
    @args[key]
  end

  def length
    @args.length
  end

  def to_s
    str = "#{@name}(\n"
    @args.each do |arg|
      str << "    :#{arg[0]} => "
      if arg[1].is_a? Symbol
        str << ":#{arg[1]}"
      elsif arg[1].is_a? String
        str << '"' + arg[1] + '"'
      elsif arg[1].is_a? Array
        str << "[ "
        arg[1].each do |item|
          if item.is_a? Symbol
            str << ":#{item}"
          elsif item.is_a? String
            str << '"' + item + '"'
          end
          str << ", "
        end
        str << " ]"
      end

      str << ",\n"
    end
    str << ")"
    str
  end
end

class StringType
  def initialize
    @data = ""
  end

  def <<(data)
    @data << data
  end

  def to_native
    @data
  end
end

class SymbolType < StringType
  def to_native
    @data.to_sym
  end
end

class NameType < StringType; end

class ArrayType
  def initialize
    @ary = []
  end

  def push(value)
    @ary.push value.to_native
  end

  def to_native
    @ary
  end
end

class MapEntry
  attr_accessor :key, :value

  def push(value)
    if @read_key
      @value = value.to_native
    else
      @key = value.to_native
      @read_key = true
    end
  end

  def to_native
    { @key => @value }
  end
end

class MapType
  def initialize
    @map = {}
  end

  def push(value)
    @map = @map.merge(value.to_native)
  end

  def to_native
    @map
  end
end

class ArgType < MapEntry; end

class BuildFile
  attr :type
  attr_reader :types
  attr_accessor :debug

  def initialize
    @lhs = []
    @types = []
  end

  def leave
    # Get the top of the stack, pop it, then push the old top into the new.
    current = @lhs[-1]
    @lhs.pop

    if current.is_a? OutputType
      @types.push(current)
    elsif !@lhs[-1].nil?
      @lhs[-1].push(current)
    end

    puts "Leaving #{current}" if @debug
  end

  def parse_file(file_name)
    @file_name = file_name
    data = IO.read(file_name)
    parse(data)
  end

  def show_bad_line
    line = 1
    column = 1
    current_line = ""

    for n in 0 ... @p
      char = @data[n].chr

      if char == "\n"
        line += 1
        column = 1
        current_line = ""
      else
        column += 1
        current_line << char
      end
    end

    n += 1

    while @data[n] && @data[n].chr != "\n"
      current_line << @data[n].chr
      n += 1
    end

    error_msg = "Parse error (#{line}, #{column}) "
    error_msg << "in file '#{@file_name}'" unless @file_name.nil?
    error_msg << "\n\n #{current_line}"

    error_msg
  end
end
