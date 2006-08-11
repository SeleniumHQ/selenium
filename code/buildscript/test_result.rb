class TestResult
  def initialize(testname, pass, message=nil)
    @testname = testname
    @pass = pass
    @message = message
  end
  attr_reader :testname
  
  def to_xml
     result = "<testcase name='#{testname}' time='0'>\n"
     result << "\t<failure message='#{CGI::escape(@message)}' />\n" unless @pass
     result << "</testcase>\n"
  end
end
