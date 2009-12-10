//
//  Cookie.m
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

#import "Cookie.h"
#import "Context.h"
#import "HTTPStaticResource.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "NSException+WebDriver.h"
#import "NSString+SBJSON.h"
#import "WebDriverResponse.h"
#import "WebViewController.h"

@implementation Cookie

- (id) initWithSessionId:(int)sessionId {
  self = [super init];
  if (!self) {
    return nil;
  }
  sessionId_ = sessionId;
  return self;
}

+ (Cookie*) cookieWithSessionId:(int)sessionId {
  return [[[Cookie alloc] initWithSessionId:sessionId] autorelease];
}

- (NSURL *)currentUrl {
  return [NSURL URLWithString:[[self viewController] URL]];
}

- (void) deleteAllCookies {
  NSHTTPCookieStorage* cookieStorage =
  [NSHTTPCookieStorage sharedHTTPCookieStorage];
  NSArray* theCookies = [cookieStorage cookiesForURL:[self currentUrl]];
  for (NSHTTPCookie *cookie in theCookies) {
    [cookieStorage deleteCookie:cookie];
  }
}

- (void) deleteCookie:(NSString *)name {
  NSHTTPCookieStorage* cookieStorage =
  [NSHTTPCookieStorage sharedHTTPCookieStorage];
  NSArray* theCookies = [cookieStorage cookiesForURL:[self currentUrl]];
  for (NSHTTPCookie *cookie in theCookies) {
    if ([[cookie name] isEqualToString:name]) {
      [cookieStorage deleteCookie:cookie];
      break;
    }
  }
}

- (NSArray*) getCookies {
  NSHTTPCookieStorage* cookieStorage =
  [NSHTTPCookieStorage sharedHTTPCookieStorage];
  NSArray* theCookies = [cookieStorage cookiesForURL:[self currentUrl]];
  NSMutableArray* toReturn = [NSMutableArray arrayWithCapacity:
                              [theCookies count]];
  for (NSHTTPCookie *cookie in theCookies) {
    NSMutableDictionary* cookieDict =
    [NSMutableDictionary dictionaryWithObjectsAndKeys:
     [cookie name], @"name",
     [cookie value], @"value",
     [cookie domain], @"domain",
     [cookie path], @"path",
     [NSNumber numberWithBool:[cookie isSecure]], @"secure",
     nil];
    
    NSDate* expires = [cookie expiresDate];
    if (expires != nil) {
      [cookieDict setObject:[expires description] forKey:@"expires"];
    }
    [toReturn addObject:cookieDict];
  }
  return toReturn;
}

- (void)addCookie:(NSDictionary *)cookie {
  NSURL* currentUrl = [self currentUrl];
  NSString* domain = [cookie objectForKey:@"domain"];
  
  if (domain == nil) {
    domain = [currentUrl host];
  } else {
    // Strip off the port if the domain has one.
    domain = [[domain componentsSeparatedByString:@":"] objectAtIndex:0];
    if (![[currentUrl host] isEqualToString:domain]) {
      @throw [NSException webDriverExceptionWithMessage:
              [NSString stringWithFormat:
               @"You may only set cookies for the current domain:"
               " Expected <%@>, but was <%@>", [currentUrl host], domain]
                                         webDriverClass:
              @"java.lang.IllegalArgumentException"];
    }
  }
  
  
  NSString* path = [cookie objectForKey:@"path"];
  if (path == nil) {
    path = @"/";
  }
  
  // We need to convert the cookie data from the format used by WebDriver to one
  // recognized by the NSHTTPCookie class.
  NSMutableDictionary* cookieProperties =
  [NSMutableDictionary dictionaryWithObjectsAndKeys:
   [cookie objectForKey:@"name"], NSHTTPCookieName,
   [cookie objectForKey:@"value"], NSHTTPCookieValue,
   domain, NSHTTPCookieDomain,
   path, NSHTTPCookiePath,
   nil];
  
  NSString* expires = [cookie objectForKey:@"expires"];
  if (expires != nil) {
    [cookieProperties setObject:expires forKey:NSHTTPCookieExpires];
  }
  
  NSNumber* secure = [cookie objectForKey:@"secure"];
  if ([secure boolValue] == YES) {
    [cookieProperties setObject:@"true" forKey:NSHTTPCookieSecure];
  }
  
  NSArray *cookieToAdd = [NSArray arrayWithObject:
                          [NSHTTPCookie cookieWithProperties:cookieProperties]];
  [[NSHTTPCookieStorage sharedHTTPCookieStorage]
   setCookies:cookieToAdd forURL:currentUrl mainDocumentURL:nil];
}

- (NSArray *)getArgumentListFromData:(NSData *)data {
  id requestData = nil;
  
  if ([data length] > 0) {
    NSString *dataString = [[NSString alloc] initWithData:data
                                                 encoding:NSUTF8StringEncoding];
    requestData = [dataString JSONFragmentValue];
    [dataString release];
  }
  
  if (requestData != nil && ![requestData isKindOfClass:[NSArray class]]) {
    NSLog(@"Invalid argument list - Expecting an array but given %@",
          requestData);
    return nil;
  }
  
  return (NSArray *)requestData;
}

- (id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
                                           method:(NSString *)method
                                         withData:(NSData *)theData {
  // Check the query. It should match /session/:session/:context/cookie. If
  // the method is DELETE, then it may match
  // /session/:session/:context/cookie/:name, where :name is the name of the
  // cookie to delete.
  WebDriverResponse* response = nil;
  id result = nil;
  @try {
    if ([method isEqualToString:@"GET"]) {
      result = [self getCookies];
    } else if ([method isEqualToString:@"POST"]) {
      NSArray* arguments = [self getArgumentListFromData:theData];
      NSDictionary* cookieData = [arguments objectAtIndex:0];
      [self addCookie:cookieData];
    } else if ([method isEqualToString:@"DELETE"]) {
      // Check the query to see what type of delete to do. If the query is just
      // /hub/session/:session/:context/cookie, delete everything. Otherwise, it
      // should be /hub/session/:session/:context/cookie/:name, where :name is
      // the cookie to delete.
      NSArray* parts = [query componentsSeparatedByString:@"/"];
      if ([parts count] == 6) {
        [self deleteAllCookies];
      } else if ([parts count] == 7) {
        [self deleteCookie:[parts lastObject]];
      } else {
        return nil;  // Query we can't handle.
      }
    } else {
      response = [WebDriverResponse responseWithError:
                  [NSString stringWithFormat:@"Invalid method for resource; %@",
                   method]];
    }
  }
  @catch (NSException* e) {
    response = [WebDriverResponse responseWithError:e];
  }
  
  // If response != nil, there was an error.
  if (response == nil) {
    response = [WebDriverResponse responseWithValue:result];
  }
  
  [response setSessionId:[NSString stringWithFormat:@"%d", sessionId_]];
  [response setContext:[Context contextName]];
  return response;
}

- (id<HTTPResource>)elementWithQuery:(NSString *)query {
  return self;
}

@end

