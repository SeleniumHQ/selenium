#import <UIKit/UIKit.h>

@class iPhoneHTTPServerViewController;
@class HTTPServer;

@interface iPhoneHTTPServerAppDelegate : NSObject <UIApplicationDelegate>
{
	HTTPServer *httpServer;
	
	UIWindow *window;
	iPhoneHTTPServerViewController *viewController;
}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet iPhoneHTTPServerViewController *viewController;

@end

