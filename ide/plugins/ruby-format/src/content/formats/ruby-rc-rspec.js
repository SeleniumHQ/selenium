/*
 * Format for Selenium Remote Control RSpec client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/remoteControl.js', this);

this.name = "ruby-rc-rspec";

function testMethodName(testName) {
	return "test_" + underscore(testName);
}

function assertTrue(expression) {
	return expression.toString() + ".should be_true";
}

function assertFalse(expression) {
	return expression.invert().toString() + ".should be_false";
}

function verify(statement) {
	return "begin\n" +
		indent(1) + statement + "\n" +
		"rescue ExpectationNotMetError\n" +
		indent(1) + "@verification_errors << $!\n" + 
		"end";
}

function verifyTrue(expression) {
	return verify(assertTrue(expression));
}

function verifyFalse(expression) {
	return verify(assertFalse(expression));
}

function joinExpression(expression) {
    return expression.toString() + ".join(\",\")";
}

function assignToVariable(type, variable, expression) {
	return variable + " = " + expression.toString();
}

function waitFor(expression) {
	if (expression.negative) {
		return "!60.times{ break unless (" + expression.invert().toString() + " rescue true); sleep 1 }"
	} else {
		return "!60.times{ break if (" + expression.toString() + " rescue false); sleep 1 }"
	}
}

function assertOrVerifyFailure(line, isAssert) {
	return "assert_raise(Kernel) { " + line + "}";
}

Equals.prototype.toString = function() {
	return this.e1.toString() + " == " + this.e2.toString();
}

Equals.prototype.assert = function() {
    return "(" + this.e1.toString() + ").should == " + this.e2.toString();
}

Equals.prototype.verify = function() {
	return verify(this.assert());
}

NotEquals.prototype.toString = function() {
	return this.e1.toString() + " != " + this.e2.toString();
}

NotEquals.prototype.assert = function() {
    return "(" + this.e1.toString() + ").should != " + this.e2.toString();
}

NotEquals.prototype.verify = function() {
	return verify(this.assert());
}

RegexpMatch.prototype.toString = function() {
	return "/" + this.pattern.replace(/\//g, "\\/") + "/ =~ " + this.expression;
}

RegexpNotMatch.prototype.toString = function() {
	return "/" + this.pattern.replace(/\//g, "\\/") + "/ !~ " + this.expression;
}

function pause(milliseconds) {
	return "sleep " + (parseInt(milliseconds) / 1000);
}

function echo(message) {
	return "p " + xlateArgument(message);
}

function statement(expression) {
	expression.noBraces = true;
	return expression.toString();
}

function array(value) {
	var str = '[';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += ']';
	return str;
}

function nonBreakingSpace() {
    return "\"\\xa0\"";
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += underscore(this.message);
	if (!this.noBraces && this.args.length > 0) {
		result += '(';
	} else if (this.args.length > 0) {
		result += ' ';
	}
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	if (!this.noBraces && this.args.length > 0) {
		result += ')';
	}
	return result;
}

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return "# " + str;
		});
}

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {    
    formattedSuite = 'require "spec/ruby"\n' +
			'require "spec/runner"\n' +
			'\n' +
			"# output T/F as Green/Red\n" +
			"ENV['RSPEC_COLOR'] = 'true'\n" +
			'\n';
        
	    for (var i = 0; i < testSuite.tests.length; ++i) {
					// have saved or loaded a suite
					if (typeof testSuite.tests[i].filename != 'undefined') {
						formattedSuite += 'require File.join(File.dirname(__FILE__),  "' + testSuite.tests[i].filename.replace(/\.\w+$/,'') + '")\n';
					} else {
					// didn't load / save as a suite
						var testFile = testSuite.tests[i].getTitle();
						formattedSuite += 'require "' + testFile + '"\n';
				}
			}
    return formattedSuite;
}

function defaultExtension() {
  return this.options.defaultExtension;
}

this.options = {
	receiver: "page",
	rcHost: "localhost",
	rcPort: "4444",
	environment: "*chrome",
	header: 
		'require "rubygems"\n' +
		'gem "rspec"\n' + 
		'gem "selenium-client"\n' +
		'require "selenium/client"\n' +
		'require "selenium/rspec/spec_helper"\n' +
		'require "spec/test/unit"\n' +
		'\n' +
		'describe "${className}" do\n' +
		'  attr_reader :selenium_driver\n' +
		'  alias :${receiver} :selenium_driver\n' +
		'\n' +
		'  before(:all) do\n' +
		'    @verification_errors = []\n' +
		'    @selenium_driver = Selenium::Client::Driver.new \\\n' +
		'      :host => "${rcHost}",\n' +
		'      :port => ${rcPort},\n' + 
		'      :browser => "${environment}",\n' + 
		'      :url => "${baseURL}",\n' + 
		'      :timeout_in_second => 60\n' +
		'  end\n' +
		'\n' +
		'  before(:each) do\n' +
		'    @selenium_driver.start_new_browser_session\n' +
		'  end\n' +
		'  \n' +
		'  append_after(:each) do\n' +
		'    @selenium_driver.close_current_browser_session\n' +
		'    @verification_errors.should == []\n' +
		'  end\n' +
		'  \n' +
		'  it "${methodName}" do\n',
	footer:
		"  end\n" +
		"end\n",
	indent: "2",
	initialIndents: "2",
	defaultExtension: "rb"
};

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Selenium RC host</description>' +
	'<textbox id="options_rcHost" />' +
	'<description>Selenium RC port</description>' +
	'<textbox id="options_rcPort" />' +
	'<description>Environment</description>' +
	'<textbox id="options_environment" />' +
	'<description>Header</description>' +
	'<textbox id="options_header" multiline="true" flex="1" rows="4"/>' +
	'<description>Footer</description>' +
	'<textbox id="options_footer" multiline="true" flex="1" rows="4"/>' +
	'<description>Indent</description>' +
	'<menulist id="options_indent"><menupopup>' +
	'<menuitem label="Tab" value="tab"/>' +
	'<menuitem label="1 space" value="1"/>' +
	'<menuitem label="2 spaces" value="2"/>' +
	'<menuitem label="3 spaces" value="3"/>' +
	'<menuitem label="4 spaces" value="4"/>' +
	'<menuitem label="5 spaces" value="5"/>' +
	'<menuitem label="6 spaces" value="6"/>' +
	'<menuitem label="7 spaces" value="7"/>' +
	'<menuitem label="8 spaces" value="8"/>' +
	'</menupopup></menulist>';