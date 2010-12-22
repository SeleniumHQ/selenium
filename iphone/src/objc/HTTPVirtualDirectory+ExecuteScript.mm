//
//  HTTPVirtualDirectory+ExecuteScript.m
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

#import "HTTPVirtualDirectory+ExecuteScript.h"

#include <string>
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "NSException+WebDriver.h"
#import "NSObject+SBJSON.h"
#import "NSString+SBJSON.h"
#import "WebViewController.h"
#include "atoms.h"
#include "errorcodes.h"

@implementation HTTPVirtualDirectory (ExecuteScript)

// Compiles a NULL terminated |atom| into a single string object.
-(NSString*) compileAtom:(const wchar_t* const[])atom {
  std::wstring compiled(L"");
  for (size_t i = 0; atom[i] != NULL; i++) {
    compiled.append(std::wstring(atom[i]));
  }
  std::string tmp(compiled.begin(), compiled.end());
  return [NSString stringWithUTF8String:tmp.c_str()];
}

-(id) executeAtom:(const wchar_t* const[])atom
         withArgs:(NSArray*) args {
  return [self executeJsFunction:[self compileAtom:atom]
                        withArgs:args];
}

-(id) executeJsFunction:(NSString*)script
               withArgs:(NSArray*)args {
  NSString* argsString = [args JSONRepresentation];
  NSLog(@"Args: %@", argsString);
  NSString* result = [[self viewController] jsEval:@"(%@)(%@,%@,true)",
      [self compileAtom:webdriver::EXECUTE_SCRIPT],
      script,
      [args JSONRepresentation]];
  NSLog(@"Got result: %@", result);

  NSDictionary* resultDict = (NSDictionary*) [result JSONValue];
  int status = [(NSNumber*) [resultDict objectForKey:@"status"] intValue];
  if (status != SUCCESS) {
    NSDictionary* value = (NSDictionary*) [resultDict objectForKey:@"value"];
    NSString* message = (NSString*) [value objectForKey:@"message"];
    @throw [NSException webDriverExceptionWithMessage:message
                                        andStatusCode:status];
  }
  return [resultDict objectForKey:@"value"];
}

@end
