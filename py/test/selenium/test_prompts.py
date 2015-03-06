from selenium import selenium
import unittest
import time

class TestPrompts(unittest.TestCase):
    def setUp(self):
        self.selenium = selenium("localhost", \
            4444, "*firefoxproxy", "http://www.w3schools.com")
        self.selenium.start()
        
    def test_alert(self):
        sel = self.selenium
        sel.open("/js/tryit.asp?filename=tryjs_alert")
        sel.select_frame("view")
        sel.click("css=input[value='Show alert box']")
        self.assertEqual(sel.get_alert(), "Hello! I am an alert box!")
    
    def test_confirm_accept(self):
        sel = self.selenium
        sel.open("/js/tryit.asp?filename=tryjs_confirm")
        sel.select_frame("view")
        sel.choose_ok_on_next_confirmation()
        sel.click("css=input[value='Show a confirm box']")
        self.assertEqual(sel.get_alert(), "You pressed OK!")
    
    def test_confirm_cancel(self):
        sel = self.selenium
        sel.open("/js/tryit.asp?filename=tryjs_confirm")
        sel.select_frame("view")
        sel.choose_ok_on_next_confirmation()
        sel.click("css=input[value='Show a confirm box']")
        self.assertEqual(sel.get_alert(), "You pressed OK!")

    def test_prompt(self):
        sel = self.selenium
        sel.open("/js/tryit.asp?filename=tryjs_prompt")
        sel.select_frame("view")
        sel.answer_on_next_prompt('Flying Monkey')
        sel.click("css=input[value='Show prompt box']")
        self.assertEqual(sel.get_html_source(), '<head></head><body>Hello Flying Monkey! How are you today?</body>')

    def tearDown(self):
        self.selenium.stop()

if __name__ == "__main__":
    unittest.main()