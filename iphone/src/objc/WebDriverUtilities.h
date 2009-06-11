//
//  WebDriverUtilities.h
//  iWebDriver
//
//  Created by Yu Chen on 5/27/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>

// This class provides a set of class methods.
@interface WebDriverUtilities : NSObject {
}
+ (void)cleanCookies;
+ (void)cleanCache;
+ (void)cleanDatabases;
@end
