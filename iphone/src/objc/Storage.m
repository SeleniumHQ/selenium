/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

#import "Storage.h"
#import "WebDriverResource.h"
#import "WebViewController.h"
#import "HTTPVirtualDirectory+AccessViewController.h"

@implementation Storage

- (id)initWithSessionId:(int)sessionId andType:(NSString *)type {
  self = [super init];
  if (!self) {
    return nil;
  }
  sessionId_ = sessionId;
  storageType_ = type;

  [self setIndex:
   [WebDriverResource resourceWithTarget:self
                               GETAction:@selector(keySet)
                              POSTAction:@selector(setItem:)
                               PUTAction:NULL
                            DELETEAction:@selector(clearStorage)]];
	
  [self setMyWebDriverHandlerWithGETAction:@selector(storageSize) 
                                POSTAction:NULL 
                                  withName:@"size"];
  return self;
}

+ (Storage *)storageWithSessionId:(int)sessionId andType:(NSString *)type {
  return [[[Storage alloc] initWithSessionId:sessionId andType:type] autorelease];
}

- (NSString *)storageSize {
  NSString *size = [[self viewController] jsEval:[NSString stringWithFormat:
                                                  @"%@.length", storageType_]];
  if ([size isEqualToString:@""]) {
    size = @"0";
  }
  return size;
}

- (NSArray *)keySet {
  NSString *result;
  int length = [[self storageSize] intValue];
  NSMutableArray *keys = [NSMutableArray arrayWithCapacity:length];
  if (length > 0) {
    for (int itemIndex = 0; itemIndex < length; itemIndex++) {
      result = [[self viewController] jsEval:[NSString stringWithFormat:
                                              @"%@.key(%d)",
                                              storageType_, itemIndex]];
      [keys addObject:result];
    }
  }
  return keys;
}

- (void)setItem:(NSDictionary *)items {
  NSString *key = [items objectForKey:@"key"];
  NSString *value = [items objectForKey:@"value"];
  [[self viewController] jsEval:[NSString stringWithFormat:
                                 @"%@.setItem('%@', '%@')", 
                                 storageType_, key, value]];
}

- (void)clearStorage {
  [[self viewController] jsEval:[NSString stringWithFormat:
                                 @"%@.clear()", storageType_]];
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  if ([query length] > 0) {
    NSString *storageKey = [query substringFromIndex:1];
    id<HTTPResource> resource = [contents objectForKey:storageKey];
    if (resource == nil && storageKey != @"size") {
      [self setResource:[KeyedStorage keyedStorage:storageKey andType:storageType_]
               withName:storageKey];
    }
  }  
  return [super elementWithQuery:query];
}

- (void)dealloc {
  [storageType_ release];
  [super dealloc];
}

@end

@implementation KeyedStorage

- (id)initWithKey:(NSString *)key andType:(NSString *)type {
  if (![super init]) {
    return nil;
  }
  key_ = key;
  storageType_ = type;
  [self setIndex:
   [WebDriverResource resourceWithTarget:self
                               GETAction:@selector(getItem)
                              POSTAction:NULL
                               PUTAction:NULL
                            DELETEAction:@selector(removeItem)]];
  return self;
}

+ (KeyedStorage *)keyedStorage:(NSString *)key andType:(NSString *)type {
  return [[[KeyedStorage alloc] initWithKey:key andType:type] autorelease];
}

- (NSString *)getItem {
  return [[self viewController] jsEval:[NSString stringWithFormat:
                                        @"%@.getItem('%@')",
                                        storageType_, key_]];
}

- (NSString *)removeItem {
  return [[self viewController] jsEval:[NSString stringWithFormat:
           @"(function(key) {\n"
            "  var temp=%@.getItem(key);\n"
            "  %@.removeItem(key);\n"
            "  return temp;\n"
            "})('%@')",
           storageType_, storageType_,	key_]];
}

@end

