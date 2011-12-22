#import <Cocoa/Cocoa.h>

@class HTTPServer;


@interface DynamicServerAppDelegate : NSObject <NSApplicationDelegate>
{
	HTTPServer *httpServer;
	
	NSWindow *window;
}

@property (assign) IBOutlet NSWindow *window;

@end
