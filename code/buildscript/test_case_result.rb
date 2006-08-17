require 'htree/traverse'
require 'htree/parse'

class TestCaseResult
  def self.parse_jsunit(url)
    test_case_strings = url.split("/").last.split("|")
    TestCaseResult.new(test_case_strings[0], test_case_strings[2] == 'S', test_case_strings[3], test_case_strings[1])
  end
  
  def self.parse_selenium(table, name)
    TestCaseResult.new(name.strip, failed_commands(table).size == 0, table)
  end
  
  private
  def self.failed_commands(table)
    doc = HTree.parse(table)
    result = []
    doc.traverse_element("tr") do |e|
      begin 
        bgcolor = e.fetch_attr("bgcolor")
      rescue
        # if there isn't "bgcolor" attribute, just ignore this row
        next
      end
      result << e if bgcolor == "#ffcccc"
    end
    return result
  end
  
  public
  def initialize(testname, pass, message=nil, time=0)
    @testname = testname
    @pass = pass
    @message = message
    @time = time
  end
  attr_reader :testname, :time, :message
  
  def pass?
    @pass
  end
  
  def to_xml
    result = "<testcase name='#{@testname}' time='#{@time}'>\n"
    result << "\t<failure message='#{CGI::escape(@message)}' />\n" unless @pass
    result << "</testcase>\n"
  end
end
