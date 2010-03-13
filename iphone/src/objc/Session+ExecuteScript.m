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
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "NSObject+SBJSON.h"
#import "WebViewController.h"
#import "NSException+WebDriver.h"
#import "Element.h"
#import "ElementStore.h"
#import "errorcodes.h"

@implementation Session (ExecuteScript)

#pragma mark Argument Parsing

// The arguments passed to executeScript may be any JSON value. DOM elements are
// encoded as {"ELEMENT": id}, where id is the ID assigned by the |ElementStore|
// when the element is first found on the page.
- (NSString *)convertValueToJavascript:(id)value {
  // No type checking/error checking involved here. Script arguments are written
  // to JSON, but since they were parsed from the request, we already know they
  // are valid JSON values.
  if ([value isKindOfClass:[NSArray class]]) {
    NSArray* arrayValue = (NSArray*) value;
    return [self convertArrayToJavascript:arrayValue];
  } else if ([value isKindOfClass:[NSDictionary class]]) {
    return [self convertDictionaryToJavascript:(NSDictionary*)value];
  } else {
    return [value JSONFragment];
  }
}

- (NSString *)convertArrayToJavascript:(NSArray *)array {
  NSMutableString *converted = [NSMutableString stringWithCapacity:128];
  [converted appendString:@"["];
  
  for (id element in array) {
    [converted appendString:[self convertValueToJavascript:element]];
    [converted appendString:@","];
  }
  [converted appendString:@"]"];
  return converted;
}

- (NSString *)convertDictionaryToJavascript:(NSDictionary *)dictionary {
  id elementId = [dictionary objectForKey:@"ELEMENT"];
  if (elementId != nil && [elementId isKindOfClass:[NSString class]]) {
    return [[self elementStore]
            jsLocatorForElementWithId:(NSString *)elementId];
  }
  NSMutableString *converted = [NSMutableString stringWithCapacity:128];
  [converted appendString:@"{"];
  NSArray* keys = [dictionary allKeys];
  BOOL addComma = NO;
  for (id value in keys) {
    if (addComma) {
      [converted appendString:@","];
    } else {
      addComma = YES;
    }
    [converted appendString:[value JSONFragment]];
    [converted appendString:@":"];
    [converted appendString:[self convertValueToJavascript:
                             [dictionary objectForKey:value]]];
  }
  [converted appendString:@"}"];
  return converted;
}

#pragma mark Resource Handler

// Execute the script given. Returns a dictionary with type: and value:
// properties.
- (NSDictionary *)executeScript:(NSDictionary *)arguments {
  NSString *code = [arguments objectForKey:@"script"];
  NSString *argsAsString = [self convertValueToJavascript:
                            [arguments objectForKey:@"args"]];

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
                                        andStatusCode:EUNHANDLEDERROR]);
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

  // Now that we have the result, we need to return it as a valid JSON value.
  // All DOM elements in the result will be encoded as {"ELEMENT":id}, where id
  // is an ID assigned by the |ElementStore|.
  
  if ([type isEqualToString:@"NULL"]) {
    return nil;
  } else if ([type isEqualToString:@"ELEMENT"]) {
    // The function returned an element. Cache the element in the local
    // |ElementStore| (in the virtual directory).
    Element *elem = [[self elementStore] elementFromJSObject:@"result"];
    return [elem idDictionary];
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
      // TODO: add support for arrays and maps
      value = result;
    }
    return value;
  }
}

@end
