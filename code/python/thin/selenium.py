import httplib

class selenium_class:

	def __init__(self, host, port):
		self.host = host
		self.port = port
		self.sessionId = None

	def start(self, browserStartCommand, browserURL):
		result = self.do_command("getNewBrowserSession", browserStartCommand, browserURL)
		try:
			self.sessionId = long(result)
		except ValueError:
			raise Exception, result
		
	def stop(self):
		self.do_command("testComplete", "", "")
		self.sessionId = None

	def do_command(self, verb, arg1='', arg2=''):
		conn = httplib.HTTPConnection(self.host, self.port)
		commandString = '/selenium-server/driver/?commandRequest=|' + verb + '|' + str(arg1) + '|' + str(arg2) + '|'
		if (None != self.sessionId):
			commandString = commandString + "&sessionId=" + str(self.sessionId)
		#print 'do_command(' + verb + ',' + str(arg1) + ',' + str(arg2) + ') -> ' + commandString + '\n'
		conn.request("GET", commandString)
	
		response = conn.getresponse()
		#print response.status, response.reason
		data = response.read()
		result = response.reason
		#print "Selenium Result: " + str(data) + "\n\n"
		return str(data)

	def do_action(self, verb, arg1='', arg2=''):
		result = self.do_command(verb, arg1, arg2)
		if ("OK" != result):
			raise Exception, result

	def do_verify(self, verb, arg1='', arg2=''):
		result = self.do_command(verb, arg1, arg2)
		if ("PASSED" != result):
			raise Exception, result

# These functions were generated based on the Java Client Driver
	def type(self, arg0, arg1):
		self.do_action("type", arg0, arg1)

	def get_value(self, arg0):
		return self.do_command("getValue", arg0)

	def check(self, arg0):
		self.do_action("check", arg0)

	def close(self):
		self.do_action("close")

	def open(self, arg0):
		self.do_action("open", arg0)

	def answer_on_next_prompt(self, arg0):
		self.do_action("answerOnNextPrompt", arg0)

	def choose_cancel_on_next_confirmation(self):
		self.do_action("chooseCancelOnNextConfirmation")

	def click(self, arg0):
		self.do_action("click", arg0)

	def key_press(self, arg0, arg1):
		self.do_action("keyPress", arg0, arg1)

	def key_down(self, arg0, arg1):
		self.do_action("keyDown", arg0, arg1)

	def mouse_over(self, arg0):
		self.do_action("mouseOver", arg0)

	def mouse_down(self, arg0):
		self.do_action("mouseDown", arg0)

	def fire_event(self, arg0, arg1):
		self.do_action("fireEvent", arg0, arg1)

	def go_back(self):
		self.do_action("goBack")

	def select(self, arg0, arg1):
		self.do_action("select", arg0, arg1)

	def select_window(self, arg0):
		self.do_action("selectWindow", arg0)

	def submit(self, arg0):
		self.do_action("submit", arg0)

	def uncheck(self, arg0):
		self.do_action("uncheck", arg0)

	def verify_alert(self, arg0):
		self.do_verify("verifyAlert", arg0)

	def verify_attribute(self, arg0, arg1, arg2):
		self.do_verify("verifyAttribute", arg0, arg1, arg2)

	def verify_confirmation(self, arg0):
		self.do_verify("verifyConfirmation", arg0)

	def verify_editable(self, arg0):
		self.do_verify("verifyEditable", arg0)

	def verify_element_not_present(self, arg0):
		self.do_verify("verifyElementNotPresent", arg0)

	def verify_element_present(self, arg0):
		self.do_verify("verifyElementPresent", arg0)

	def verify_location(self, arg0):
		self.do_verify("verifyLocation", arg0)

	def verify_not_editable(self, arg0):
		self.do_verify("verifyNotEditable", arg0)

	def verify_not_visible(self, arg0):
		self.do_verify("verifyNotVisible", arg0)

	def verify_prompt(self, arg0):
		self.do_verify("verifyPrompt", arg0)

	def verify_selected(self, arg0, arg1):
		self.do_verify("verifySelected", arg0, arg1)

	def verify_table(self, arg0, arg1):
		self.do_verify("verifyTable", arg0, arg1)

	def verify_text(self, arg0, arg1):
		self.do_verify("verifyText", arg0, arg1)

	def verify_text_present(self, arg0):
		self.do_verify("verifyTextPresent", arg0)

	def verify_text_not_present(self, arg0):
		self.do_verify("verifyTextNotPresent", arg0)

	def verify_title(self, arg0):
		self.do_verify("verifyTitle", arg0)

	def verify_value(self, arg0, arg1):
		self.do_verify("verifyValue", arg0, arg1)

	def verify_visible(self, arg0):
		self.do_verify("verifyVisible", arg0)

	def wait_for_value(self, arg0, arg1):
		self.do_action("waitForValue", arg0, arg1)

	def wait_for_condition(self, arg0, arg1):
		self.do_action("waitForCondition", arg0, arg1)

	def wait_for_page_to_load(self, arg0):
		self.do_action("waitForPageToLoad", arg0)

	def set_context(self, arg0, arg1):
		self.do_action("setContext", arg0, arg1)

	def set_context(self, arg0):
		self.do_action("setContext", arg0)

	def get_all_buttons(self):
		return self.do_command("getAllButtons")

	def get_all_links(self):
		return self.do_command("getAllLinks")

	def get_all_fields(self):
		return self.do_command("getAllFields")

	def get_attribute(self, arg0, arg1):
		return self.do_command("getAttribute", arg0, arg1)

	def get_checked(self, arg0):
		return self.do_command("getChecked", arg0)

	def get_eval(self, arg0):
		return self.do_command("getEval", arg0)

	def get_table(self, arg0):
		return self.do_command("getTable", arg0)

	def get_text(self, arg0):
		return self.do_command("getText", arg0)

	def get_title(self):
		return self.do_command("getTitle")

	def get_absolute_location(self):
		return self.do_command("getAbsoluteLocation")

	def get_prompt(self):
		return self.do_command("getPrompt")

	def get_confirmation(self):
		return self.do_command("getConfirmation")

	def get_alert(self):
		return self.do_command("getAlert")

	def get_select_options(self, arg0):
		return self.do_command("getSelectOptions", arg0)

	def get_all_actions(self):
		return self.do_command("getAllActions")

	def get_all_accessors(self):
		return self.do_command("getAllAccessors")

	def get_all_asserts(self):
		return self.do_command("getAllAsserts")

