//
//  WebDriverRequestFetcher.h
//  iWebDriver
//
//  Created by Yu Chen on 4/16/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//
#import <Foundation/Foundation.h>
#import "HTTPResponse.h"
@class RESTServiceMapping;
@class WebViewController;

// This class fetches webdriver requests from a server (connector) that connects 
// webdriver requesters and iWebdrivers; the targeted requester is identified by
// requesterId.
@interface WebDriverRequestFetcher : NSObject {
  NSString* connectorAddr;
  NSString* requesterId;
	
  WebViewController *viewController_;
  RESTServiceMapping *serviceMapping_;
	
  NSString *status_;
}

@property (retain, nonatomic) WebViewController *viewController;
@property (retain, nonatomic) RESTServiceMapping* serviceMapping;
@property (readonly, nonatomic, copy) NSString *status;

// Singleton
+ (WebDriverRequestFetcher *)sharedInstance;
@end
