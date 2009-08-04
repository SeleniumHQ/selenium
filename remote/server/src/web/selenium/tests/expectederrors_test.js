function testCanHandleExpectedErrors(driver) {
  driver.callFunction(function() {
    fail('This command triggers an error, but it should be caught as an\n' +
         'expected failure. The error event should have its propagation\n' +
         'stopped, so the test runner never sees it.  If you see this\n' +
         'error message, that means the event propagation was not stopped\n' +
         '(or the this error was not cauhgt).');
  });
  driver.expectErrorFromPreviousCommand(
      'If the previous command did not raise an error, the test should fail\n' +
      'with this error message');
}


function testCanHandleExpectedErrorsFromANestedCommand(driver) {  
  driver.callFunction(function() {
    driver.addCommand(function() {
      fail('This command triggers an error, but it should be caught as an\n' +
           'expected failure. The error event should have its propagation\n' +
           'stopped, so the test runner never sees it.  If you see this\n' +
           'error message, that means the event propagation was not stopped\n' +
           '(or the this error was not cauhgt).');
    }, /*addToFront=*/true);
  });
  driver.expectErrorFromPreviousCommand(
      'If the previous command did not raise an error, the test should fail\n' +
      'with this error message');
}



