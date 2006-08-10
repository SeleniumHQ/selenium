require "jsunit_result_parser"
require "selenium_result_parser"

class JsUnitResultParserTest < Test::Unit::TestCase
  def setup
    @parser = JsUnitResultParser.new
    @request_body = "id=&userAgent=Mozilla%2F5.0+%28Windows%3B+U%3B+Windows+NT+5.1%3B+en-US%3B+rv%3A1.8.0.6%29+Gecko%2F20060728+Firefox%2F1.5.0.6&jsUnitVersion=2.2&time=9.704&url=http%3A%2F%2Flocalhost%3A8889%2Fjavascript%2Funittest%2Fbrowserbot%2Fsuite.html%3Ft%253D1155175664.828000&cacheBuster=1155175675875&testCases=http%3A%2F%2Flocalhost%3A8889%2Fjavascript%2Funittest%2Fbrowserbot%2Falert-handling-tests.html%3AtestShouldRemoveAlertWhenItIsRetreived%7C0%7CS%7C%7C&testCases=http%3A%2F%2Flocalhost%3A8889%2Fjavascript%2Funittest%2Fbrowserbot%2Falert-handling-tests.html%3AtestShouldReportMultipleAlertsInOrderIfGenerated%7C0%7CS%7C%7C&testCases=http%3A%2F%2Flocalhost%3A8889%2Fjavascript%2Funittest%2Fbrowserbot%2Falert-handling-tests.html%3AtestShouldReportSingleAlertIfGenerated%7C0%7CS%7C%7C"
  end
  
  def test_smoke
    assert true
  end
  
  def test_should_parse_multiple_test_cases_from_request_body
    expected_result = ["http://localhost:8889/javascript/unittest/browserbot/alert-handling-tests.html:testShouldRemoveAlertWhenItIsRetreived|0|S||", "http://localhost:8889/javascript/unittest/browserbot/alert-handling-tests.html:testShouldReportMultipleAlertsInOrderIfGenerated|0|S||", "http://localhost:8889/javascript/unittest/browserbot/alert-handling-tests.html:testShouldReportSingleAlertIfGenerated|0|S||"]
    test_cases = @parser.parse(@request_body)
    assert_equal(3, test_cases.size)
    assert_equal(expected_result, test_cases)
  end
  
  def test_should_generate_junit_report_from_request_body
    expected_result = ["http://localhost:8889/javascript/unittest/browserbot/alert-handling-tests.html:testShouldRemoveAlertWhenItIsRetreived|0|S||", "http://localhost:8889/javascript/unittest/browserbot/alert-handling-tests.html:testShouldReportMultipleAlertsInOrderIfGenerated|0|S||", "http://localhost:8889/javascript/unittest/browserbot/alert-handling-tests.html:testShouldReportSingleAlertIfGenerated|0|S||"]
    xml = @parser.to_xml(@request_body)
    expected_result.each do |url|
      assert(xml.include?(url))
    end
#    puts xml
  end
end

class SeleniumResultParserTest < Test::Unit::TestCase
  def setup
    @parser = SeleniumResultParser.new
    request_body = "selenium.version=%40VERSION%40&selenium.revision=%40REVISION%40&result=passed&totalTime=2&numTestPasses=2&numTestFailures=0&numCommandPasses=1&numCommandFailures=0&numCommandErrors=0&testTable.1=%3Cdiv%3E%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++%3Ctbody%3E%0D%0A++++%3Ctr+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++%3Ctd+rowspan%3D%221%22+colspan%3D%223%22%3ETest+Form+Auto-completion+is+disabled%3Cbr%3E%0D%0A++++++%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Eopen%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E..%2Ftests%2Fhtml%2Ftest_type_page1.html%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Etype%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3Eusername%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3ETestUser%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Etype%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3Epassword%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EtestUserPassword%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3EclickAndWait%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EsubmitButton%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++++%3Ctd%3EverifyTextPresent%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EWelcome%2C+TestUser%21%3Cbr%3E%0D%0A++++++++%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++%3C%2Ftbody%3E%0D%0A%3C%2Ftable%3E%0D%0A%0D%0A%3C%2Fdiv%3E&testTable.2=%3Cdiv%3E%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++%3Ctbody%3E%0D%0A++++%3Ctr+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++%3Ctd+rowspan%3D%221%22+colspan%3D%223%22%3ETest+popup+Window%3Cbr%3E%0D%0A++++++%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Eopen%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E..%2Ftests%2Fhtml%2Ftest_select_window.html%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Eclick%3C%2Ftd%3E%0D%0A++++++%3Ctd%3EpopupPage%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Epause%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E1000%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%0D%0A++++%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3EselectWindow%3C%2Ftd%3E%0D%0A++++++%3Ctd%3EmyPopupWindow%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++%3Ctd%3Eclose%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%3C%2Ftd%3E%0D%0A++++++%3Ctd%3E%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++%3C%2Ftbody%3E%0D%0A%3C%2Ftable%3E%0D%0A%0D%0A%3C%2Fdiv%3E&numTestTotal=3&suite=%0D%0A%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++++++++%3Ctbody%3E%0D%0A++++++++++++%3Ctr%3E%3Ctd+bgcolor%3D%22%23ccffcc%22%3E%3Cb%3ETest+Suite%3C%2Fb%3E%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++++++++++%3Ctr%3E%3Ctd+bgcolor%3D%22%23ccffcc%22%3E%3Ca+href%3D%22.%2FTestFormAutocomplete.html%22%3ETest+Form+Auto-complete%3C%2Fa%3E%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++++++++++%3Ctr%3E%3Ctd+bgcolor%3D%22%23ccffcc%22%3E%3Ca+href%3D%22.%2FTestPopupWindow.html%22%3ETest+Popup+Window%3C%2Fa%3E%3C%2Ftd%3E%3C%2Ftr%3E%0D%0A++++++++%3C%2Ftbody%3E%0D%0A++++%3C%2Ftable%3E%0D%0A%0D%0A%0D%0A"
    @req = RequestStub.new(request_body)
  end
  
  def test_smoke
    assert_equal("passed", @req.query["result"])
    assert_equal("@VERSION@", @req.query["selenium.version"])
  end
  
  def test_should_generate_junit_report_from_request
    xml = @parser.to_xml(@req)
    puts xml
  end
  
  def test_should_generate_result_table_from_request
    puts @parser.to_html(@req)
  end
end

class RequestStub
  def initialize(request_body)
    @request_body = request_body
  end

  def query 
    result = Hash.new
    @request_body.split("&").each do |pair|
      aPair = pair.split("=")
      result.store(aPair[0], CGI.unescape(aPair[1]))
    end
    return result
  end
end