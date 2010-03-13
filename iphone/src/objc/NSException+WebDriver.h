//
//  NSException+WebDriver.h
//  iWebDriver
//
//  Created by Joseph Gentle on 1/15/09.
//  Copyright 2009 Google Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

// This category allows resource methods to throw exceptions which
// are sent over the wire to webdriver.
@interface NSException (WebDriver)

+ (NSException *)webDriverExceptionWithMessage:(NSString *)message
                                 andStatusCode:(int)statusCode;

+ (NSString *)webdriverExceptionName;

@end
