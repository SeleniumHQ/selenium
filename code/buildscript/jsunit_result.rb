require 'cgi'
require 'builder'

require 'test_case_result'

class JsUnitResult

  def initialize(req)
    @req = req
    @test_cases = parse
  end

  def to_xml
    fail_count = 0
    @test_cases.each do |test_case|
      fail_count += 1 unless test_case.passed?
    end
    xml = Builder::XmlMarkup.new
    xml.testsuite(:name => "JsUnitTests", :tests => @test_cases.size, :errors => 0, :failures => fail_count) do
      @test_cases.each do |test_case|
        xml << test_case.to_xml
      end
    end
    xml.target!
  end
  
  def success?
    @test_cases.each do |test_case|
      return false unless test_case.passed?
    end
    return true
  end
  
  alias to_html to_xml
  
  private
  def parse
    strings = CGI::unescape(@req.body).split("&testCases=")
    strings.shift
    result = []
    strings.each do |url|
      result << TestCaseResult.parse_jsunit(url)
    end
    result
  end
    
end
