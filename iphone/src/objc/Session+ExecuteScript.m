//
//  Session+ExecuteScript.m
//  iWebDriver
//
//  Copyright 2009 Google Inc.
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

#import "Session+ExecuteScript.h"

#import "HTTPVirtualDirectory+ExecuteScript.h"

@implementation Session (ExecuteScript)

-(id) executeScript:(NSDictionary *)arguments {
  return [self executeJsFunction:[NSString stringWithFormat:@"function(){%@}",
                                  [arguments objectForKey:@"script"]]
                        withArgs:[arguments objectForKey:@"args"]];
}

-(id) executeAsyncScript:(NSDictionary*) arguments {
  return [self executeAsyncJsFunction:[arguments objectForKey:@"script"]
                             withArgs:[arguments objectForKey:@"args"]
                          withTimeout:[self scriptTimeout]];
}

@end
