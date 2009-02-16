//
//  Context+ExecuteScript.m
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

#import "Context+ExecuteScript.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "NSObject+SBJSON.h"
#import "WebViewController.h"
#import "NSException+WebDriver.h"
#import "Element.h"

@implementation Context (ExecuteScript)

// The arguments passed to executeScript look like [{value:123 type:"NUMBER"}]
- (NSArray *)convertArgumentsToJavascript:(NSArray *)arguments {
  NSMutableArray *convertedArguments
  = [NSMutableArray arrayWithCapacity:[arguments count]];
  
  for (id element in arguments) {
    if (![element isKindOfClass:[NSDictionary class]]) {
      NSLog(@"Could not parse argument %@", element);
      [convertedArguments addObject:[NSNull null]];
    }
    
    NSDictionary *arg = (NSDictionary *)element;
    id value = [arg objectForKey:@"value"];
    NSString *type = [arg objectForKey:@"type"];
    if ([type isEqualToString:@"ELEMENT"]) {
      // TODO(josephg): Get the element and put a javascript expression for it
      // in the argument.
      value = @"{}";
    }
    //    NSLog(@"argument: %@ of type %@", value, type);
    
    // Except for elements, I can just let the JSON code work out the type from
    // the JSON.
    [convertedArguments addObject:value];
  }
  
  return convertedArguments;
}

// Execute the script given. Returns a dictionary with type: and value:
// properties.
- (NSDictionary *)executeScript:(NSString *)code
                  withArguments:(NSArray *)arguments {
  arguments = [self convertArgumentsToJavascript:arguments];
  
  NSString *argsAsString = [arguments JSONRepresentation];
  if (argsAsString == nil)
    argsAsString = @"null";
  
  // Execute the script and store the result in 'result'.
  [[self viewController] jsEval:@"var f = function(){%@};\r"
                                "var result = f.apply(null, %@);",
                                code, argsAsString];
  
  NSString *result = [[self viewController] jsEval:@"result"];
  BOOL isNull = [[self viewController] jsElementIsNullOrUndefined:@"result"];
  NSString *isElement = [[self viewController]
                         jsEval:@"result instanceof HTMLElement"];
  
  // Now that we have the result, we need to return it like:
  //   {type: 'VALUE', value: 'true'}.
  // If the method returned null or undefined, we should return
  //   {type: 'NULL'}
  // ... And if the method returns an element we should return it like this:
  //   {type: 'ELEMENT', value: 'element/123'}
  
  if (isNull) {
    // Return {type: 'NULL'}
    return [NSDictionary dictionaryWithObjectsAndKeys:
            @"NULL", @"type", nil];
  } else if ([isElement isEqualToString:@"true"]) {
    // The function returned an element. Cache the element in the local
    // |ElementStore| (in the virtual directory).
    Element *elem = [[self elementStore] elementFromJSObject:@"result"];
    
    // Return {type: 'ELEMENT', value: 'element/123'}
    return [NSDictionary dictionaryWithObjectsAndKeys:
            [elem url], @"value",
            @"ELEMENT", @"type", nil];
  } else {
    // Return {type: 'VALUE', value: 'cheese'}
    return [NSDictionary dictionaryWithObjectsAndKeys:
            result, @"value",
            @"VALUE", @"type", nil];
  }
}

@end
