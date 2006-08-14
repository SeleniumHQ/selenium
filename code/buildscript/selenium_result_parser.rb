require "builder"
require "hpricot"

require "test_result"
#selenium.version=%40VERSION%40&selenium.revision=%40REVISION%40&result=passed&totalTime=2&numTestPasses=2&numTestFailures=0&numCommandPasses=1&numCommandFailures=0&numCommandErrors=0&testTable.1=%3Cdiv%3E%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++%3Ctbody%3E%0D%0A++++%3Ctr+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++%3Ctd+rowspan%3D%221%22+colspan%3D%223%22%3ETest+Form+Auto-completion+is+disabled%3Cbr%3E%0D%0A++++++%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Eopen%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E..%2Ftests%2Fhtml%2Ftest_type_page1.html%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Etype%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3Eusername%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3ETestUser%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Etype%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3Epassword%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EtestUserPassword%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3EclickAndWait%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EsubmitButton%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++++%3Ctd%3EverifyTextPresent%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EWelcome%2C+TestUser%21%3Cbr%3E%0D%0A++++++++%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++%3C%2Ftbody%3E%0D%0A%3C%2Ftable%3E%0D%0A%0D%0A%3C%2Fdiv%3E&testTable.2=%3Cdiv%3E%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++%3Ctbody%3E%0D%0A++++%3Ctr+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++%3Ctd+rowspan%3D%221%22+colspan%3D%223%22%3ETest+popup+Window%3Cbr%3E%0D%0A++++++%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Eopen%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E..%2Ftests%2Fhtml%2Ftest_select_window.html%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Eclick%3C%2Ftd%3E%0D%0A++++++%3Ctd%3EpopupPage%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Epause%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E1000%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%0D%0A++++%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3EselectWindow%3C%2Ftd%3E%0D%0A++++++%3Ctd%3EmyPopupWindow%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Eclose%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++%3C%2Ftbody%3E%0D%0A%3C%2Ftable%3E%0D%0A%0D%0A%3C%2Fdiv%3E&numTestTotal=3&suite=%0D%0A%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++++++++%3Ctbody%3E%0D%0A++++++++++++%3Ctr%3E%3Ctd+bgcolor%3D%22%23ccffcc%22%3E%3Cb%3ETest+Suite%3C%2Fb%3E%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++++++++++%3Ctr%3E%3Ctd+bgcolor%3D%22%23ccffcc%22%3E%3Ca+href%3D%22.%2FTestFormAutocomplete.html%22%3ETest+Form+Auto-complete%3C%2Fa%3E%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++++++++++%3Ctr%3E%3Ctd+bgcolor%3D%22%23ccffcc%22%3E%3Ca+href%3D%22.%2FTestPopupWindow.html%22%3ETest+Popup+Window%3C%2Fa%3E%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++++++%3C%2Ftbody%3E%0D%0A++++%3C%2Ftable%3E%0D%0A%0D%0A%0D%0A
class SeleniumResultParser
  def to_xml(req)  
    results = parse(req)
    xml = Builder::XmlMarkup.new(:indent => 1)
    xml.testsuite(
        "tests" => req.query["numTestPasses"].to_i + req.query["numTestFailures"].to_i, 
        "errors" => 0,
        "failures" => req.query["numTestFailures"],
        "time" => req.query["totalTime"],
        "name" => "SeleniumTestSuite") do 
      results.each do |result|
        xml << result.to_xml
      end
    end
  end
  
  def to_html(req)
    result = req.query["suite"]
     (1..number_of_tests(req)).each do |i|
      result += req.query["testTable.#{i}"]
    end
    return result
  end
  
  def parse(req)
    doc = Hpricot(req.query["suite"])
    results = []
    suites = doc.search("//a")
    for i in 1..suites.size
      testname = suites[i-1].attributes["href"]
      pass = test_pass?(req, i)
      message = error_message(req, i) unless pass
      testresult = TestResult.new(testname, pass, message)      
      results<<testresult      
    end
    return results
  end
  
  private 
  def test_pass?(req, index)
    failed_commands(req, index).size == 0
  end
  
  def error_message(req, index)
    result = ""
    failed_commands(req, index).each do |tr|
      error = tr.attributes["title"]
      result << error << "\n" if error!=nil
    end
    return result
  end
  
  def failed_commands(req, index)
    doc = Hpricot(req.query["testTable.#{index}"])
    return doc.search("//tr[@bgcolor=#ffcccc]")
  end
  
  def number_of_tests(req)
    req.query["numTestPasses"].to_i + req.query["numTestFailures"].to_i  
  end
end
