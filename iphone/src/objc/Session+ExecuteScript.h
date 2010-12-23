//
//  Session+ExecuteScript.h
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

#import <Foundation/Foundation.h>
#import "Session.h"

// This category implements the :context/execute and :context/execute_async
// functions.
@interface Session (ExecuteScript)

// Executes a user supplied snippet of JavaScript. This resource handler expects
// its |arguments| dictionary to contain two keys:
//   - script: The script to execute.  The script should be a NSString defining
//             a function body.
//   - args: An array of arguments to pass to the script. The arguments may be
//           referenced from the |script| via the arguments object.
//
// Returns the script result.
- (id)executeScript:(NSDictionary *)arguments;

// Executes a user supplied asynchronous JavaScript snippet.
- (id)executeAsyncScript:(NSDictionary *)arguments;

@end
