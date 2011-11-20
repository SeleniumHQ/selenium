//
//  WebDriverPreferences.h
//  iWebDriver
//
//  Created by Yu Chen on 5/11/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WebDriverPreferences : NSObject {
  // Can be "Client" or "Server".
  NSString* mode_;

  NSUInteger diskCacheCapacity_;
  NSUInteger memoryCacheCapacity_;
  NSURLRequestCachePolicy cachePolicy_;

  NSString* gridUrl_;
  // Preferences used when iWebDriver is running in server mode.
  UInt16 serverPortNumber_;

  // Preferences used when iWebDriver is running in client mode.
  NSString* connectorAddr_;
  NSString* connectorPathPrefix_;
  NSString* requesterId_;
}

@property (readonly, nonatomic, copy) NSString *mode;

@property (readonly, nonatomic) NSUInteger diskCacheCapacity;
@property (readonly, nonatomic) NSUInteger memoryCacheCapacity;
@property (readonly, nonatomic) NSURLRequestCachePolicy cache_policy;

@property (readonly, nonatomic) UInt16 serverPortNumber;
@property (readonly, nonatomic) NSString *gridLocation;
@property (readonly, nonatomic) NSString *gridPort;
@property (readonly, nonatomic, copy) NSString *connectorAddr;
@property (readonly, nonatomic, copy) NSString *requesterId;

// Singleton
+ (WebDriverPreferences *)sharedInstance;
@end
