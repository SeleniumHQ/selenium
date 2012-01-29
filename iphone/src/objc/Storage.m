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

- (id)initWithType:(NSString *)type {
  self = [super init];
  if (!self) {
    return nil;
  }
  storageType_ = type;

  [self setIndex:
   [WebDriverResource resourceWithTarget:self
                               GETAction:@selector(keySet)
                              POSTAction:@selector(setItem:)
                               PUTAction:NULL
                            DELETEAction:@selector(clearStorage)]];
	
  [self setResource:[WebDriverResource resourceWithTarget:self
                                                GETAction:@selector(storageSize) 
                                               POSTAction:NULL]
           withName:@"size"];
  
  [self setResource:[[[KeyedStorage alloc] initWithType:type] autorelease]
           withName:@"key"];
  
  return self;
}

+ (Storage *)storageWithType:(NSString *)type {
  return [[[Storage alloc] initWithType:type] autorelease];
}


- (NSNumber *)storageSize {
  NSString *size = [[self viewController] jsEval:[NSString stringWithFormat:
                                                  @"%@.length", storageType_]];
  if ([size isEqualToString:@""]) {
    size = @"0";
  }
  NSNumberFormatter * f = [[NSNumberFormatter alloc] init];
  [f setNumberStyle:NSNumberFormatterDecimalStyle];
  NSNumber * sizeN = [f numberFromString:size];
  [f release];
  return sizeN;
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

- (void)dealloc {
  [storageType_ release];
  [super dealloc];
}

@end

@implementation KeyedStorage

- (id)initWithType:(NSString *)type {
  if (![super init]) {
    return nil;
  }
  key_ = nil;
  storageType_ = type;
  [self setIndex:
   [WebDriverResource resourceWithTarget:self
                               GETAction:@selector(getItem)
                              POSTAction:NULL
                               PUTAction:NULL
                            DELETEAction:@selector(removeItem)]];
  return self;
}

- (NSString *)getItem {
  NSString* item = [[self viewController] jsEval:[NSString stringWithFormat:
                                        @"%@.getItem('%@')",
                                        storageType_, key_]];
  key_ = nil;
  return item;
}

- (NSString *)removeItem {
  NSString* item = [[self viewController] jsEval:[NSString stringWithFormat:
           @"(function(key) {\n"
            "  var temp=%@.getItem(key);\n"
            "  %@.removeItem(key);\n"
            "  return temp;\n"
            "})('%@')",
           storageType_, storageType_,	key_]];
  key_ = nil;
  return item;
}

- (id<HTTPResource>)elementWithQuery:(NSString*) key {
  if  ([key characterAtIndex:0] == '/') {
    key_ = [key substringFromIndex:1];
  } else {
    key_ = key;
  }
  return [super elementWithQuery:@""];
}

@end

