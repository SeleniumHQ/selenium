require "cgi"
require 'builder'

class JsUnitResultParser
  def parse(body)
    strings = CGI::unescape(body).split("&testCases=")
    strings.delete_at(0)
    strings
  end
  
  def to_xml(body)
    test_cases = parse(body)
    xml = Builder::XmlMarkup.new
    xml.testsuite(:name => "JsUnitTests", :tests => test_cases.size) do
      test_cases.each do |test_case|
        xml.testcase(:name => test_case) 
      end
    end
  end
end