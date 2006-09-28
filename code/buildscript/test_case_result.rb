require 'cgi'
require 'htree/traverse'
require 'htree/parse'

# Represents the results of a test-case
class TestCaseResult

  def self.parse_jsunit(url)
    (name, time, status, message) = url.split('|', 4)
    result = TestCaseResult.new(name.split("/").last, time)
    case status
    when 'S'
      # okay
    when 'F'
      result.failure_message = message
    when 'E'
      result.error_message = message
    else
      raise "unrecognised status: #{status}"
    end
    result
  end
  
  def self.parse_selenium(table, name)
    result = TestCaseResult.new(name.strip)
    if failed_commands(table).size > 0
      result.failure_message = table
    end
    result
  end
  
  private
  def self.failed_commands(table)
    doc = HTree.parse(table)
    result = []
    doc.traverse_element("tr") do |e|
      begin 
        className = e.fetch_attr("class")
        result << e if className =~ /fail/
      rescue
        # if there isn't "bgcolor" attribute, just ignore this row
      end
    end
    return result
  end
  
  public

  def initialize(name, time=nil)
    @name = name
    @time = time
  end

  attr_reader :name, :time
  attr_accessor :failure_message, :error_message
  
  def passed?
    @failure_message.nil? && @error_message.nil?
  end

  def to_xml
    xml = %{<testcase name="#{@name}"}
    xml << %{ time="#{@time}"} if @time
    xml << ">\n"
    xml << %{  <failure message="#{CGI::escapeHTML(@failure_message)}"/>\n} if @failure_message
    xml << %{  <error message="#{CGI::escapeHTML(@error_message)}"/>\n} if @error_message
    xml << %{</testcase>\n}
    xml
  end

end
