#import <Foundation/Foundation.h>

@class HTTPMessage;
@class GCDAsyncSocket;


#define WebSocketDidDieNotification  @"WebSocketDidDie"

@interface WebSocket : NSObject
{
	dispatch_queue_t websocketQueue;
	
	HTTPMessage *request;
	GCDAsyncSocket *asyncSocket;
	
	NSData *term;
	
	BOOL isStarted;
	BOOL isOpen;
	BOOL isVersion76;
	
	id delegate;
}

+ (BOOL)isWebSocketRequest:(HTTPMessage *)request;

- (id)initWithRequest:(HTTPMessage *)request socket:(GCDAsyncSocket *)socket;

/**
 * Delegate option.
 * 
 * In most cases it will be easier to subclass WebSocket,
 * but some circumstances may lead one to prefer standard delegate callbacks instead.
**/
@property (/* atomic */ assign) id delegate;

/**
 * The WebSocket class is thread-safe, generally via it's GCD queue.
 * All public API methods are thread-safe,
 * and the subclass API methods are thread-safe as they are all invoked on the same GCD queue.
**/
@property (nonatomic, readonly) dispatch_queue_t websocketQueue;

/**
 * Public API
 * 
 * These methods are automatically called by the HTTPServer.
 * You may invoke the stop method yourself to close the WebSocket manually.
**/
- (void)start;
- (void)stop;

/**
 * Public API
 * 
 * Sends a message over the WebSocket.
 * This method is thread-safe.
**/
- (void)sendMessage:(NSString *)msg;

/**
 * Subclass API
 * 
 * These methods are designed to be overriden by subclasses.
**/
- (void)didOpen;
- (void)didReceiveMessage:(NSString *)msg;
- (void)didClose;

@end

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#pragma mark -
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * There are two ways to create your own custom WebSocket:
 * 
 * - Subclass it and override the methods you're interested in.
 * - Use traditional delegate paradigm along with your own custom class.
 * 
 * They both exist to allow for maximum flexibility.
 * In most cases it will be easier to subclass WebSocket.
 * However some circumstances may lead one to prefer standard delegate callbacks instead.
 * One such example, you're already subclassing another class, so subclassing WebSocket isn't an option.
**/

@protocol WebSocketDelegate
@optional

- (void)webSocketDidOpen:(WebSocket *)ws;

- (void)webSocket:(WebSocket *)ws didReceiveMessage:(NSString *)msg;

- (void)webSocketDidClose:(WebSocket *)ws;

@end