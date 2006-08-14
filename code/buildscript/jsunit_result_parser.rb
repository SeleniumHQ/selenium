require "cgi"
require 'builder'
require "test_result"

class JsUnitResultParser
  def parse(body)
    strings = CGI::unescape(body).split("&testCases=")
    strings.delete_at(0)
    strings
  end
  
  def to_xml(req)
    test_cases = parse(req.body)
    xml = Builder::XmlMarkup.new
    xml.testsuite(:name => "JsUnitTests", :tests => test_cases.size) do
      test_cases.each do |test_case|
        xml.testcase(:name => test_case) 
      end
    end
  end
  
  alias to_html to_xml
end
