//
//  GTMUnitTestDevLog.h
//  
//  Copyright 2008 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License.  You may obtain a copy
//  of the License at
// 
//  http://www.apache.org/licenses/LICENSE-2.0
// 
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
//  License for the specific language governing permissions and limitations under
//  the License.
//

#import "GTMDefines.h"
#import <Foundation/Foundation.h>

// GTMUnitTestDevLog tracks what messages are logged to verify that you only
// log what you expect to log during the running of unittests. This allows you
// to log with impunity from your actual core implementations and still be able
// to find unexpected logs in your output when running unittests.
// In your unittests you tell GTMUnitTestDevLog what messages you expect your
// test to spit out, and it will cause any that don't match to appear as errors
// in your unittest run output. You can match on exact strings or standard 
// regexps.
// Set GTM_SHOW_UNITTEST_DEVLOGS in the environment to show the logs that that
// are expected and encountered.  Otherwise they aren't display to keep the
// unit test results easier to read.

@interface GTMUnitTestDevLog : NSObject
// Log a message
+ (void)log:(NSString*)format, ... NS_FORMAT_FUNCTION(1,2);
+ (void)log:(NSString*)format args:(va_list)args NS_FORMAT_FUNCTION(1,0);

// Turn tracking on/off
+ (void)enableTracking;
+ (void)disableTracking;
+ (BOOL)isTrackingEnabled;

// Note that you are expecting a string that has an exact match. No need to
// escape any pattern characters.
+ (void)expectString:(NSString *)format, ... NS_FORMAT_FUNCTION(1,2);

// Note that you are expecting a pattern. Pattern characters that you want
// exact matches on must be escaped. See [GTMRegex escapedPatternForString].
// Patterns match across newlines (kGTMRegexOptionSupressNewlineSupport) making
// it easier to match output from the descriptions of NS collection types such
// as NSArray and NSDictionary.
+ (void)expectPattern:(NSString *)format, ... NS_FORMAT_FUNCTION(1,2);

// Note that you are expecting exactly 'n' strings
+ (void)expect:(NSUInteger)n 
    casesOfString:(NSString *)format, ... NS_FORMAT_FUNCTION(2,3);

// Note that you are expecting exactly 'n' patterns
+ (void)expect:(NSUInteger)n 
    casesOfPattern:(NSString*)format, ... NS_FORMAT_FUNCTION(2,3);
+ (void)expect:(NSUInteger)n 
    casesOfPattern:(NSString*)format args:(va_list)args NS_FORMAT_FUNCTION(2,0);

// Call when you want to verify that you have matched all the logs you expect
// to match. If your unittests inherit from GTMTestcase (like they should) you
// will get this called for free.
+ (void)verifyNoMoreLogsExpected;

// Resets the expected logs so that you don't have anything expected.
// In general should not be needed, unless you have a variable logging case
// of some sort.
+ (void)resetExpectedLogs;
@end

// Does the same as GTMUnitTestDevLog, but the logs are only expected in debug.
// ie-the expect requests don't count in release builds.
@interface GTMUnitTestDevLogDebug : GTMUnitTestDevLog
@end
