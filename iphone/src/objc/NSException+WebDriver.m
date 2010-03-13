//
//  NSException+WebDriver.m
//  iWebDriver
//
//  Created by Joseph Gentle on 1/15/09.
//  Copyright 2009 Google Inc. All rights reserved.
//

#import "NSException+WebDriver.h"


static NSString* const WEBDRIVER_EXCEPTION_NAME = @"kWebDriverException";


@implementation NSException (WebDriver)

+ (NSException *)webDriverExceptionWithMessage:(NSString *)message
                                 andStatusCode:(int)statusCode {
  // TODO: Work out how to send a proper stack trace
  NSDictionary *value = [NSDictionary dictionaryWithObjectsAndKeys:
                         message, @"message",
                         [NSArray array], @"stackTrace",
                         nil];

  NSDictionary *userDict = [NSDictionary dictionaryWithObjectsAndKeys:
                            [NSNumber numberWithInt:statusCode], @"status",
                            value, @"value",
                            nil];
  
  return [NSException exceptionWithName:WEBDRIVER_EXCEPTION_NAME
                                 reason:message
                               userInfo:userDict];
}

+ (NSString *)webdriverExceptionName {
  return WEBDRIVER_EXCEPTION_NAME;
}

@end
