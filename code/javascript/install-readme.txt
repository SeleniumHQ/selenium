Copy the "core" folder to a web accessible directory in the same web server as the application you want to test.
In Apache, this would mean a subdirectory of "htdocs".

Because of javascript security settings standard in most browsers, Selenium Core needs to be available on the same host and port as your application.  (If this doesn't work for you, you may need to try Selenium Remote Control or Selenium IDE.)

Once deployed to the server, to run Selenium's self-tests, check out:
http://<webservername>:<port>/core/TestRunner.html

Read the website for more details. (http://www.openqa.org/selenium-core/usage.html)
