class ExecutionPoint
  
  attr_reader :backtrace

  def self.current
    new(caller)
  end
  
  def initialize(backtrace)
    @backtrace = backtrace
  end
  
  def file_name
    /\A(.*?):\d+/.match(@backtrace.first)[1]
  end
  
  def line_number
    Integer(/\A.*?:(\d+)/.match(@backtrace.first)[1])
  end

  def ==(other)
    return false unless other.is_a?(ExecutionPoint)
    (file_name == other.file_name) and (line_number == other.line_number)
  end
  
  def to_s
    "file: #{file_name} line: #{line_number}"
  end
  
  def inspect
    to_s
  end
  
end
