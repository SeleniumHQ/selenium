//
//  HTTPVirtualDirectory+ExecuteScript.h
//  iWebDriver
//
//  Copyright 2010 WebDriver committers
//  Copyright 2010 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import <Foundation/Foundation.h>
#import "HTTPVirtualDirectory.h"

@interface HTTPVirtualDirectory (ExecuteScript)

// Compiles and executes a JavaScript |atom| in the |UIViewController|. The
// |atom|, which must be defined by a function literal, must be specified in a
// NULL terminated array. Each script argument must be a JSON friendly value:
// NSNumber, NSString, NSNull, NSArray, or NSDictionary. If an argument value is
// a NSDictionary, and contaisn the "ELEMENT" key, it will be interpreted as a
// DOM element reference, as defined by the WebDriver wire protocol:
//   http://code.google.com/p/selenium/wiki/JsonWireProtocol
//
// Returns the script result; throws an exception if it fails.
-(id) executeAtom:(const char* const[])atom
         withArgs:(NSArray*) arguments;

// Executes a JavaScript function in the |UIViewController|. Each script
// argument mut be a JSON friendly value: NSNumber, NSString, NSNUll, NSArray,
// or NSDictionary. If an argument value is a NSDictionary and contains the
// "ELEMENT" key, it will be interpreted as a DOM element reference, as defined
// by the WebDriver wire protocol:
//   http://code.google.com/p/selenium/wiki/JsonWireProtocol
//
// Returns the script result; throws an exception if it fails.
-(id) executeJsFunction:(NSString*)functionAsString
               withArgs:(NSArray*)args;

// Similar to |executeJsFunction:withArgs:|, except the |script| defines the
// body of an asynchronous function. The last argument to this function will be
// a callback which must be invoked to signal the script has finished.
-(id) executeAsyncJsFunction:(NSString*)script
                    withArgs:(NSArray*)args
                 withTimeout:(NSTimeInterval)timeout;

@end
