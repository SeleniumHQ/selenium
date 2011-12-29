//
//  HTTPServerController.m
//  iWebDriver
//
//  Copyright 2009 Google Inc.
//  Copyright 2011 Software Freedom Conservancy.
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

#import "HTTPServerController.h"
#import "HTTPServer.h"
#import "WebDriverHTTPConnection.h"
#import "RESTServiceMapping.h"
#import "WebDriverPreferences.h"
#import "Status.h"
#import "NSObject+SBJson.h"

#import <sys/types.h>
#import <sys/socket.h>
#import <ifaddrs.h>
#import <arpa/inet.h>

@implementation HTTPServerController

@synthesize status = status_;
@synthesize viewController = viewController_;
@synthesize serviceMapping = serviceMapping_;

static NSMutableData *webData;

-(NSString *)getAddress {
  
  struct ifaddrs *head;
  if (getifaddrs(&head))
    return @"unknown";
  
  // Default to return localhost.
  NSString *address = @"127.0.0.1";
  
  // |head| contains the first element in a linked list of interface addresses.
  // Iterate through the list.
  for (struct ifaddrs *ifaddr = head;
       ifaddr != NULL;
       ifaddr = ifaddr->ifa_next) {
    
    struct sockaddr *sock = ifaddr->ifa_addr;

    NSString *interfaceName = [NSString stringWithUTF8String:ifaddr->ifa_name];

    // Ignore localhost.
    if ([interfaceName isEqualToString:@"lo0"])
      continue;
  
    // Ignore IPv6 for now.
    if (sock->sa_family == AF_INET) {
      struct in_addr inaddr = ((struct sockaddr_in *)sock)->sin_addr;
      char *name = inet_ntoa(inaddr);
      address = [NSString stringWithUTF8String:name];
      // if wifi use this, otherwise it's the carrier network (pdp_ip0)
      // keep looking for the wifi, if no other network interface is found
      // it will use the carrier network.
      if ([interfaceName isEqualToString:@"en0"]) {
        break;
      }
    }
  }
  
  freeifaddrs(head);
  
  return address;
}

-(id) init {
  if (![super init])
    return nil;
  UInt16 portNumber = [[WebDriverPreferences sharedInstance] serverPortNumber];
  NSString* grid = [[WebDriverPreferences sharedInstance] gridLocation];

  server_ = [[HTTPServer alloc] init];

  [server_ setType:@"_http._tcp."];
  [server_ setPort:portNumber];
  [server_ setConnectionClass:[WebDriverHTTPConnection class]];
  
  NSError *error;
  BOOL success = [server_ start:&error];
  
  if(!success) {
    NSLog(@"Error starting HTTP Server: %@", error);
  }

  NSLog(@"HTTP server started on addr %@ port %d",
        [self getAddress],
        [server_ port]);
  
  status_ = [[NSString alloc] initWithFormat:@"Started at http://%@:%d/wd/hub/",
             [self getAddress],
             [server_ port]];

  if([grid length] > 0) {
    NSString* gridPort = [[WebDriverPreferences sharedInstance] gridPort];
    
    NSString *registerUrlStr = [NSString stringWithFormat:@"http://%@:%@/grid/register", grid, gridPort];
    
    NSNumber *num = [NSNumber numberWithInt:1];
    
    // just want "iPad" or "iPhone"
    NSString *device = [[[[UIDevice currentDevice] model] componentsSeparatedByString:@" "] objectAtIndex:0];
    
    NSDictionary *capabilitiesDict = [NSDictionary dictionaryWithObjectsAndKeys:
      @"WebDriver", @"seleniumProtocol",
      device, @"browserName",
      num, @"maxInstances",
      @"MAC", @"platform", // TODO change from MAC to iOS
      nil];

    
    NSDictionary *configurationDict = [NSDictionary dictionaryWithObjectsAndKeys:
      [NSNumber numberWithInt:[server_ port]], @"port",
      [NSNumber numberWithBool:true], @"register",
      [self getAddress], @"host",
      @"org.openqa.grid.selenium.proxy.DefaultRemoteProxy", @"proxy",
      num, @"maxSession",
      grid, @"hubHost",
      gridPort, @"hubPort",
      @"wd", @"role",
      [NSNumber numberWithInt:5000], @"registerCycle",
      registerUrlStr, @"hub",
      [NSString stringWithFormat:@"http://%@:%d", [self getAddress], [server_ port] ], @"remoteHost",
      nil];
    
    NSDictionary *gridRegistrationData = [NSDictionary dictionaryWithObjectsAndKeys:
      @"org.openqa.grid.common.RegistrationRequest", @"class",
      [NSArray arrayWithObject:capabilitiesDict], @"capabilities",
      configurationDict, @"configuration",
      nil];
    
    NSURL *registerUrl = [NSURL URLWithString:registerUrlStr];
  
    NSMutableURLRequest *gridRegister = [NSMutableURLRequest requestWithURL:registerUrl];
    
    NSString *json = [gridRegistrationData JSONRepresentation];
    
    NSString *msgLength = [NSString stringWithFormat:@"%d", [json length]];
    
    [gridRegister addValue: msgLength forHTTPHeaderField:@"Content-Length"];
    [gridRegister setHTTPMethod:@"POST"];
    [gridRegister setHTTPBody: [json dataUsingEncoding:NSUTF8StringEncoding]];
    
    NSURLConnection *theConnection=[[NSURLConnection alloc] initWithRequest:gridRegister delegate:self];
    
    if (theConnection) {
      // Create the NSMutableData to hold the received data.
      // receivedData is an instance variable declared elsewhere.
      webData = [[NSMutableData data] retain];
    } else {
      // Inform the user that the connection failed.
      status_ = [NSString stringWithFormat:@"Couldn't connect to grid at %@", registerUrlStr];
    }
  
  }

  serviceMapping_ = [[RESTServiceMapping alloc] initWithIpAddress:[self getAddress] 
                                                             port:[server_ port]];

  return self;
}

-(void)connection:(NSURLConnection *)connection didReceiveResponse:(NSURLResponse *)response
{
    [webData setLength: 0];
}

-(void)connection:(NSURLConnection *)connection didReceiveData:(NSData *)data
{
    [webData appendData:data];
}

-(void)connection:(NSURLConnection *)connection didFailWithError:(NSError *)error
{
    NSLog(@"ERROR with theConenction");
    [connection release];
    [webData release];
}

-(void)connectionDidFinishLoading:(NSURLConnection *)connection
{
    NSLog(@"DONE. Received Bytes: %d", [webData length]);
    NSString *theXML = [[NSString alloc] initWithBytes: [webData mutableBytes] 
                                                length:[webData length] 
                                              encoding:NSUTF8StringEncoding];
    NSLog(@"%@",theXML);
    [theXML release];
}

// Singleton

static HTTPServerController *singleton = nil;

+(HTTPServerController*) sharedInstance {
  if (singleton == nil) {
    singleton = [[HTTPServerController alloc] init];
  }
  
  return singleton;
}

- (NSObject<HTTPResponse> *)httpResponseForRequest:(HTTPMessage*)request {
  return [serviceMapping_ httpResponseForRequest:request];
}

- (NSObject *)httpResponseForQuery:(NSString *)query
                            method:(NSString *)method
                          withData:(NSData *)theData {
  return [serviceMapping_.serverRoot httpResponseForQuery:query
                                                   method:method
                                                 withData:theData];
}

@end
