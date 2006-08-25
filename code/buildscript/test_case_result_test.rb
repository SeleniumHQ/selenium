require 'rubygems'
require 'test/unit'
require 'test_case_result'

class TestCaseResultTest < Test::Unit::TestCase
  
  def test_xml_generation_for_succeed_test
    test_case = TestCaseResult.new("mytest")
    assert_equal(%{<testcase name="mytest">\n</testcase>\n}, test_case.to_xml)
  end
  
  def test_xml_should_include_failure_message_if_provided
    test_case = TestCaseResult.new("mytest")
    test_case.failure_message = "bad stuff happened"
    assert_equal(%{<testcase name="mytest">\n  <failure message="bad stuff happened"/>\n</testcase>\n}, test_case.to_xml)
  end
  
  def test_xml_should_escape_failure_message
    test_case = TestCaseResult.new("mytest")
    test_case.failure_message = "<p>"
    assert_equal(%{<testcase name="mytest">\n  <failure message="&lt;p&gt;"/>\n</testcase>\n}, test_case.to_xml)
  end
  
  def test_xml_should_include_error_message_if_provided
    test_case = TestCaseResult.new("mytest")
    test_case.error_message = "VERY bad stuff happened"
    assert_equal(%{<testcase name="mytest">\n  <error message="VERY bad stuff happened"/>\n</testcase>\n}, test_case.to_xml)
  end
  
  def test_xml_should_include_time_if_provided
    test_case = TestCaseResult.new("mytest", "3.4")
    assert_equal(%{<testcase name="mytest" time="3.4">\n</testcase>\n}, test_case.to_xml)
  end
  
  def test_parse_jsunit_success
    url = 'some_web_site/alert-handling-tests.html:testShouldRemoveAlertWhenItIsRetreived|0.016|S||'
    test_case = TestCaseResult.parse_jsunit(url)
    assert_equal('alert-handling-tests.html:testShouldRemoveAlertWhenItIsRetreived', test_case.name)
    assert_equal("0.016", test_case.time)
    assert_equal(true, test_case.passed?)
  end
  
  def test_parse_jsunit_failure
    url = 'some_web_site/alert-handling-tests.html:testShouldRemoveAlertWhenItIsRetreived|0.016|F|failure message'
    test_case = TestCaseResult.parse_jsunit(url)
    assert_equal(false, test_case.passed?)
    assert_equal("failure message", test_case.failure_message)
  end
  
  def test_parse_jsunit_error
    error_message = <<EOF
Stack trace follows:
()@http://localhost:4445/javascript/core/scripts/selenium-browserbot.js:1260
([object HTMLInputElement])@http://localhost:4445/javascript/core/scripts/selenium-browserbot.js:1118
testClickRadioShouldTriggerFocusClickChangeAndBlur()@http://localhost:4445/javascript/unittest/browserbot/pagebot-action-tests.html?cacheBuster=1156403313284:154
("testClickRadioShouldTriggerFocusClickChangeAndBlur")@http://localhost:4445/javascript/jsunit/app/jsUnitTestManager.js:351
()@http://localhost:4445/javascript/jsunit/app/jsUnitTestManager.js:162
@http://localhost:4445/javascript/jsunit/app/jsUnitTestManager.js:166
EOF
    url = "some_web_site/alert-handling-tests.html:testShouldRemoveAlertWhenItIsRetreived|3.3|E|#{error_message}"
    test_case = TestCaseResult.parse_jsunit(url)
    assert_equal(false, test_case.passed?)
    assert_equal(error_message, test_case.error_message)
  end
  
  def test_should_parse_test_case_from_html_table
    table = CGI::unescape("%3Cdiv%3E%0D%0A%3Ctable+border%3D%221%22+cellpadding%3D%221%22+cellspacing%3D%221%22%3E%0D%0A++%3Ctbody%3E%0D%0A++++%3Ctr+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++%3Ctd+rowspan%3D%221%22+colspan%3D%223%22%3ETest+Form+Auto-completion+is+disabled%3Cbr%3E%0D%0A++++++%3C%2Ftd%3E%0D%0A++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Eopen%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E..%2Ftests%2Fhtml%2Ftest_type_page1.html%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Etype%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3Eusername%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3ETestUser%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3Etype%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3Epassword%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EtestUserPassword%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23eeffee%22%3E%0D%0A++++++++%3Ctd%3EclickAndWait%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EsubmitButton%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++++++%3Ctr+style%3D%22cursor%3A+pointer%3B%22+bgcolor%3D%22%23ccffcc%22%3E%0D%0A++++++++%3Ctd%3EverifyTextPresent%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3EWelcome%2C+TestUser%21%3Cbr%3E%0D%0A++++++++%3C%2Ftd%3E%0D%0A++++++++%3Ctd%3E%26nbsp%3B%3C%2Ftd%3E%0D%0A++++++%3C%2Ftr%3E%0D%0A++%3C%2Ftbody%3E%0D%0A%3C%2Ftable%3E%0D%0A%0D%0A%3C%2Fdiv%3E")
    test_name = "sample test case"
    test_case = TestCaseResult.parse_selenium(table, test_name)
    assert_equal(test_name, test_case.name)
    assert_equal(true, test_case.passed?)
  end
    
end
