//
//  NSException+WebDriver.m
//  iWebDriver
//
//  Created by Joseph Gentle on 1/15/09.
//  Copyright 2009 Google Inc. All rights reserved.
//

#import "NSException+WebDriver.h"


@implementation NSException (WebDriver)

+ (NSException *)webDriverExceptionWithMessage:(NSString *)message
                                webDriverClass:(NSString *)javaClass {
  // TODO: Work out how to send a proper stack trace
  NSDictionary *userDict = [NSDictionary dictionaryWithObjectsAndKeys:
                            message, @"localizedMessage",
                            message, @"message",
                            javaClass, @"class",
                            [NSArray array], @"stackTrace",
                            nil];
  
  return [NSException exceptionWithName:@"kWebDriverException"
                                 reason:message
                               userInfo:userDict];
}

@end
