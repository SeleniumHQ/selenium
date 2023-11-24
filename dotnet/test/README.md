# Selenium.Net Integration Tests

## Running tests locally

- Update `common\appconfig.json` : <br>
  A. Set 'DriverServiceLocation' property value to your local folder of webdrivers. <br>
  B. If you would like to run other drivers beside 'Chrome', Set 'ActiveDriverConfig' to one of the other drivers names, i.e. 'Firefox'. 
- Drivers can be downloaded from [Here](https://www.selenium.dev/documentation/webdriver/getting_started/install_drivers/#quick-reference).
- Run the tests in NUnit.

## Running tests on remote server

- Follow the instructions on [Quick start selenium server](https://www.selenium.dev/documentation/grid/getting_started/).
- Update `remote\ChromeRemoteWebDriver.cs` Uri to your remote server IP and port. i.e. "http://10.100.102.3:4444/wd/hub/".
- Same goes for the rest of the drivers types you would like to use. (can be found under 'test\remote').
- Run the tests in NUnit.
