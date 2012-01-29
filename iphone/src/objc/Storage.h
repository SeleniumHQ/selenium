/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.
 Copyright 2011 Software Freedom Conservancy.
 
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

#import <Foundation/Foundation.h>
#import "HTTPVirtualDirectory.h"

@class WebDriverResource;

// This |HTTPVirtualDirectory| matches the /hub/:session/local_storage
//  | session_storage directory in the WebDriver REST service.
@interface Storage : HTTPVirtualDirectory {
  NSString *storageType_;
}

- (id)initWithType:(NSString *)type;

+ (Storage *)storageWithType:(NSString *)type;

- (NSString *)storageSize;
- (NSArray *)keySet;
- (void)setItem:(NSDictionary *)items;
- (void)clearStorage;

@end

// This |HTTPVirtualDirectory| matches the /hub/:session/local_storage/:key
//  | session_storage/:key directory in the WebDriver REST service.
@interface KeyedStorage : HTTPVirtualDirectory {
  NSString *storageType_;
  NSString *key_;
}

- (id)initWithType:(NSString *)type;

- (NSString *)getItem;
- (NSString *)removeItem;

@end

