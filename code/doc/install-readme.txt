Copy the "selenium" folder to a web accessible directory in the same web server as the application you want to test.
In Apache, this would mean a subdirectory of "htdocs".

Because of javascript security settings standard in most browsers, Selenium needs to be available on the same host and port as your application.

Once deployed to the server, to run Selenium's self-tests, check out:
http://<webservername>:<port>/selenium/TestRunner.html

Read the website for more details. (http://selenium.thoughtworks.com)