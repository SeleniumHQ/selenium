require "Hpricot"

class TestCaseResult
  def self.parse_jsunit(url)
    test_case_strings = url.split("/").last.split("|")
    TestCaseResult.new(test_case_strings[0], test_case_strings[2] == 'S', test_case_strings[3], test_case_strings[1])
  end
  
  def self.parse_selenium(table)
    doc = Hpricot(table)
    name = doc.search("//td").first.to_s
    name = name.sub(/<td[^>]*>((.|\n|\r)*)<\/td>/) { $1 }
    TestCaseResult.new(name, failed_commands(table).size == 0, error_message(table))
  end
  
  private
  def self.failed_commands(table)
    doc = Hpricot(table)
    return doc.search("//tr[@bgcolor=#ffcccc]")
  end
  
  def self.error_message(table)
    result = ""
    failed_commands(table).each do |tr|
      error = tr.attributes["title"]
      result << error << "\n" if error!=nil
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
  attr_reader :testname, :time
  
  def pass?
    @pass
  end
  
  def to_xml
    result = "<testcase name='#{@testname}' time='#{@time}'>\n"
    result << "\t<failure message='#{CGI::escape(@message)}' />\n" unless @pass
    result << "</testcase>\n"
  end
end