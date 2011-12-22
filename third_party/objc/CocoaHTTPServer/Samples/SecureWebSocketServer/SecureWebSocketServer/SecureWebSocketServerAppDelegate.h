#import <Cocoa/Cocoa.h>

@class HTTPServer;


@interface SecureWebSocketServerAppDelegate : NSObject <NSApplicationDelegate> {
@private
	HTTPServer *httpServer;
	NSWindow *window;
}

@property (assign) IBOutlet NSWindow *window;

@end
