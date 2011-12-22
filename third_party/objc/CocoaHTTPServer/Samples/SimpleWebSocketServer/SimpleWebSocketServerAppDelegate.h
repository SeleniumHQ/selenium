#import <Cocoa/Cocoa.h>

@class HTTPServer;


@interface SimpleWebSocketServerAppDelegate : NSObject <NSApplicationDelegate>
{
	HTTPServer *httpServer;
	NSWindow *window;
}

@property (assign) IBOutlet NSWindow *window;

@end
