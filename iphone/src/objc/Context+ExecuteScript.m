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
#import "ElementStore.h"

@implementation Context (ExecuteScript)

// The arguments passed to executeScript look like [{value:123 type:"NUMBER"}]
- (NSString *)convertArgumentsToJavascript:(NSArray *)arguments {
  NSMutableString *converted = [NSMutableString stringWithCapacity:128];
  [converted appendString:@"["];
  
  for (id element in arguments) {
    if ([element isKindOfClass:[NSArray class]]) {
      [converted appendString:[self convertArgumentsToJavascript:element]];
    } else if (![element isKindOfClass:[NSDictionary class]]) {
      NSLog(@"Could not parse argument %@", element);
     @throw([NSException webDriverExceptionWithMessage:
             [NSString stringWithFormat:@"Could not parse argument %@",
              element]
                                        webDriverClass:
             @"org.openqa.selenium.WebDriverException"]);
    } else {
      NSDictionary *arg = (NSDictionary *)element;
      id value = [arg objectForKey:@"value"];
      NSString *type = [arg objectForKey:@"type"];
      if ([type isEqualToString:@"ELEMENT"]) {
        [converted appendString:[[self elementStore]
                                 jsLocatorForElementWithId:(NSString *)value]];
      } else {
        [converted appendString:[value JSONFragment]];
      }
    }
    [converted appendString:@","];
  }
  [converted appendString:@"]"];
  return converted;
}

// Execute the script given. Returns a dictionary with type: and value:
// properties.
- (NSDictionary *)executeScript:(NSString *)code
                  withArguments:(NSArray *)arguments {
  NSString *argsAsString = [self convertArgumentsToJavascript:arguments];

  // Execute the script and store the result in 'result'; if any errors occur,
  // store them in the 'error' variable.
  NSString *result = [[self viewController] jsEval:
                      @"var result, error = null;\n"
                       "(function() {\n"
                       "  var f = function(){%@};\n"
                       "  try {\n"
                       "    result = f.apply(null, %@);\n"
                       "  } catch (e) {\n"
                       "    error = e.message || e.toString();\n"
                       "  }\n"
                       "  return result;\n"
                       "})();", code, argsAsString];

  BOOL hadError = [[[self viewController] jsEval:@"error != null"]
                   isEqualToString:@"true"];
  if (hadError) {
    NSString *error = [[self viewController] jsEval:@"error.message || error"];
    @throw([NSException webDriverExceptionWithMessage:
            [NSString stringWithFormat:@"JS ERROR: %@", error]
                                       webDriverClass:
            @"org.openqa.selenium.WebDriverException"]);
  }

  // We need to know what the result type was so we can send the proper value
  // back to the client. Note that arrays and objects are not yet supported.
  NSString *type = [[self viewController] jsEval:
                    @"(function() {\n"
                     " if (null === result || undefined === result) {\n"
                     "   return 'NULL';\n"
                     " } else if (result['tagName']) {\n"
                     "   return 'ELEMENT';\n"
                     " } else {\n"
                     "   return (typeof result).toUpperCase();\n"
                     " }\n"
                     "})();"];

  // Now that we have the result, we need to return it like:
  //   {type: 'VALUE', value: 'true'}.
  // If the method returned null or undefined, we should return
  //   {type: 'NULL'}
  // ... And if the method returns an element we should return it like this:
  //   {type: 'ELEMENT', value: 'element/123'}
  
  if ([type isEqualToString:@"NULL"]) {
    // Return {type: 'NULL'}
    return [NSDictionary dictionaryWithObjectsAndKeys:
            @"NULL", @"type", nil];
  } else if ([type isEqualToString:@"ELEMENT"]) {
    // The function returned an element. Cache the element in the local
    // |ElementStore| (in the virtual directory).
    Element *elem = [[self elementStore] elementFromJSObject:@"result"];
    
    // Return {type: 'ELEMENT', value: 'element/123'}
    return [NSDictionary dictionaryWithObjectsAndKeys:
            [elem url], @"value",
            @"ELEMENT", @"type", nil];
  } else {
    id value;
    if ([type isEqualToString:@"NUMBER"]) {
      NSNumberFormatter *formatter = [[NSNumberFormatter alloc] init];
      [formatter setNumberStyle:NSNumberFormatterDecimalStyle];
      value = [formatter numberFromString:result];
      [formatter release];
    } else if ([type isEqualToString:@"BOOLEAN"]) {
      value = [NSNumber numberWithBool:[result isEqualToString:@"true"]];
    } else {
      // Result could be a string, array, or generic object. Currently, we do
      // not support arrays or generic objects (which could conceivably be
      // converted to a map).
      // TODO(webdriver-eng): add support for arrays and maps
      value = result;
    }
    // Return {type: 'VALUE', value: 'cheese'}
    return [NSDictionary dictionaryWithObjectsAndKeys:
            value, @"value",
            @"VALUE", @"type", nil];
  }
}

@end
