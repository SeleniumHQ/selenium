//
//  WebDriverPreferences.m
//  iWebDriver
//
//  Created by Yu Chen on 5/11/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import "WebDriverPreferences.h"

static NSString * const PREF_MODE = @"preference_mode";

static NSString * const PREF_DISK_CACHE_CAPACITY = @"preference_disk_cache_capacity";
static NSString * const PREF_MEMORY_CACHE_CAPACITY = @"preference_memory_cache_capacity";
static NSString * const PREF_CACHE_POLICY = @"preference_cache_policy";

static NSString * const PREF_SERVER_MODE_PORT_NUMBER = @"preference_server_mode_port_number";
static NSString * const PREF_GRID_HOST = @"preference_grid_mode_host";
static NSString * const PREF_GRID_PORT = @"preference_grid_mode_port";
static NSString * const PREF_CLIENT_MODE_CONNECTOR_ADDRESS = @"preference_client_mode_connector_address";
static NSString * const PREF_CLIENT_MODE_REQUESTER_ID = @"preference_client_mode_requester_id";

@implementation WebDriverPreferences

@synthesize mode = mode_;
@synthesize diskCacheCapacity = diskCacheCapacity_;
@synthesize memoryCacheCapacity = memoryCacheCapacity_;
@synthesize cache_policy = cachePolicy_;
@synthesize serverPortNumber = serverPortNumber_;
@synthesize gridLocation = gridLocation_;
@synthesize gridPort = gridPort_;
@synthesize connectorAddr = connectorAddr_;
@synthesize requesterId = requesterId_;

static WebDriverPreferences *singleton = nil;
+ (WebDriverPreferences*) sharedInstance {
  if (singleton == nil) {
    singleton = [[WebDriverPreferences alloc] init];
  }	
  return singleton;
}

+ (void) validateConnectorAddr:(NSString*) connAddr{
  // e.g., http://the.addr.of.connector:8801/ll
  if (connAddr == nil || 
    [connAddr isEqualToString:@""] || 
    [NSURL URLWithString: connAddr] == nil){
    @throw [NSException exceptionWithName:NSInvalidArgumentException 
                                   reason:@"Invalide Connector Address." 
                                 userInfo:nil];
  }
}

+ (void) validateRequesterId:(NSString*) reqId {
  // e.g., 171.23.11.11, mytestID
  if (reqId == nil ||[reqId isEqualToString:@""]) {
    @throw [NSException exceptionWithName:NSInvalidArgumentException 
                                   reason:@"Invalide Requester Id." 
                                 userInfo:nil];		
  }
}

+ (void) initPreferences {
  NSUserDefaults* userDefaults = [NSUserDefaults standardUserDefaults];
  id mode = [userDefaults objectForKey:PREF_MODE];
  id port = [userDefaults objectForKey:PREF_SERVER_MODE_PORT_NUMBER];

  if (mode == nil || port == nil) {
    NSLog(@"Initializing app settings to default values.");

    NSString* bundlePath = [[NSBundle mainBundle] bundlePath];
    NSString* settingsPath = [bundlePath stringByAppendingPathComponent:
                              @"Settings.bundle"];
    NSString* rootPlist = [settingsPath stringByAppendingPathComponent:
                           @"Root.plist"];

    NSDictionary* settings = [NSDictionary dictionaryWithContentsOfFile:
                              rootPlist];
    NSArray* preferences = [settings objectForKey:@"PreferenceSpecifiers"];

    NSMutableDictionary* defaultPrefs =
        [NSMutableDictionary dictionaryWithCapacity:[preferences count]];
    for (NSDictionary* item in preferences) {
      id key = [item objectForKey:@"Key"];
      if (key != nil) {
        [defaultPrefs setObject:[item objectForKey:@"DefaultValue"]
                         forKey:key];
      }
    }

    [[NSUserDefaults standardUserDefaults] registerDefaults:defaultPrefs];
    [[NSUserDefaults standardUserDefaults] synchronize];
  } else {
    NSLog(@"App settings already initialized. Mode is %@", mode);
  }
}


- (id)init {
  [WebDriverPreferences initPreferences];

  // Fetching paramters from [NSUserDefaults standardUserDefaults].
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];

  // mode can be "Server" or "Client"
  mode_ = [defaults stringForKey:PREF_MODE]; 
  if (!mode_) {
    mode_ = @"Server";
    [defaults setObject:mode_ forKey:PREF_MODE];
  }
  
  diskCacheCapacity_ = [defaults integerForKey:PREF_DISK_CACHE_CAPACITY];	
  if (!diskCacheCapacity_) {
    diskCacheCapacity_ = 0;
    [defaults setObject:@"0" forKey:PREF_DISK_CACHE_CAPACITY];
  }
  memoryCacheCapacity_ = [defaults integerForKey:PREF_MEMORY_CACHE_CAPACITY];
  if (!memoryCacheCapacity_) {
    memoryCacheCapacity_ = 0;
    [defaults setObject:@"0" forKey:PREF_MEMORY_CACHE_CAPACITY];
  }
  cachePolicy_ = [defaults integerForKey:PREF_CACHE_POLICY];


  if ([mode_ isEqualToString:@"Client"]) {
    connectorAddr_ = [defaults stringForKey:PREF_CLIENT_MODE_CONNECTOR_ADDRESS];
    if (!connectorAddr_) {
      connectorAddr_ = @"www.connector.addr";
      [defaults setObject:connectorAddr_ forKey:PREF_CLIENT_MODE_CONNECTOR_ADDRESS];	
    }
    [WebDriverPreferences validateConnectorAddr:connectorAddr_];
		
    requesterId_ = [defaults stringForKey:PREF_CLIENT_MODE_REQUESTER_ID];
    if (!requesterId_) {
      requesterId_ = @"requesterId";
      [defaults setObject:requesterId_ forKey:PREF_CLIENT_MODE_REQUESTER_ID];	
    }
    [WebDriverPreferences validateRequesterId:requesterId_];
  } else if ([mode_ isEqualToString:@"Server"]) {
    serverPortNumber_ =
        (UInt16) [defaults integerForKey:PREF_SERVER_MODE_PORT_NUMBER];
  } else {
    @throw [NSException exceptionWithName:NSInvalidArgumentException
                                   reason:@"Invalid mode." 
                                 userInfo:nil];				
  }
	
  NSString *gridHost = [defaults stringForKey:PREF_GRID_HOST];
  gridPort_ = [defaults stringForKey:PREF_GRID_PORT];
  if ([gridHost length] > 0 && [gridPort_ length] > 0) {
    gridLocation_ = [NSString stringWithFormat: @"%@", gridHost];
  }
	
				
  [defaults synchronize];
  return self;
}

- (void)dealloc {
  [mode_ release];
  [connectorAddr_ release];
  [requesterId_ release];
  [super dealloc];
}

@end
