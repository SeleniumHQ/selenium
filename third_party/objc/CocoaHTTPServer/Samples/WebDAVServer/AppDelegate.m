#import "AppDelegate.h"
#import "DDLog.h"
#import "DDTTYLogger.h"
#import "HTTPServer.h"
#import "DAVConnection.h"

static const int ddLogLevel = LOG_LEVEL_VERBOSE;

@implementation AppDelegate

- (void) applicationDidFinishLaunching:(NSNotification*)notification {
  // Configure logging system
  [DDLog addLogger:[DDTTYLogger sharedInstance]];
  
  // Create DAV server
  _httpServer = [[HTTPServer alloc] init];
  [_httpServer setConnectionClass:[DAVConnection class]];
  [_httpServer setPort:8080];
  
  // Enable Bonjour
  [_httpServer setType:@"_http._tcp."];
  
  // Set document root
  [_httpServer setDocumentRoot:[@"~/Sites" stringByExpandingTildeInPath]];
  
  // Start DAV server
  NSError* error = nil;
  if (![_httpServer start:&error]) {
    DDLogError(@"Error starting HTTP Server: %@", error);
  }
}

- (void) applicationWillTerminate:(NSNotification*)notification {
  // Stop DAV server
  [_httpServer stop];
  [_httpServer release];
  _httpServer = nil;
}

@end
