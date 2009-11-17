//
//  AsyncSocket.h
//  
//  This class is in the public domain.
//  Originally created by Dustin Voss on Wed Jan 29 2003.
//  Updated and maintained by Deusty Designs and the Mac development community.
//
//  http://code.google.com/p/cocoaasyncsocket/
//

#import <Foundation/Foundation.h>

@class AsyncSocket;
@class AsyncReadPacket;
@class AsyncWritePacket;

extern NSString *const AsyncSocketException;
extern NSString *const AsyncSocketErrorDomain;

enum AsyncSocketError
{
	AsyncSocketCFSocketError = kCFSocketError,	// From CFSocketError enum.
	AsyncSocketNoError = 0,						// Never used.
	AsyncSocketCanceledError,					// onSocketWillConnect: returned NO.
	AsyncSocketReadMaxedOutError,               // Reached set maxLength without completing
	AsyncSocketReadTimeoutError,
	AsyncSocketWriteTimeoutError
};
typedef enum AsyncSocketError AsyncSocketError;

@interface NSObject (AsyncSocketDelegate)

/**
 * In the event of an error, the socket is closed.
 * You may call "unreadData" during this call-back to get the last bit of data off the socket.
 * When connecting, this delegate method may be called
 * before"onSocket:didAcceptNewSocket:" or "onSocket:didConnectToHost:".
**/
- (void)onSocket:(AsyncSocket *)sock willDisconnectWithError:(NSError *)err;

/**
 * Called when a socket disconnects with or without error.  If you want to release a socket after it disconnects,
 * do so here. It is not safe to do that during "onSocket:willDisconnectWithError:".
**/
- (void)onSocketDidDisconnect:(AsyncSocket *)sock;

/**
 * Called when a socket accepts a connection.  Another socket is spawned to handle it. The new socket will have
 * the same delegate and will call "onSocket:didConnectToHost:port:".
**/
- (void)onSocket:(AsyncSocket *)sock didAcceptNewSocket:(AsyncSocket *)newSocket;

/**
 * Called when a new socket is spawned to handle a connection.  This method should return the run-loop of the
 * thread on which the new socket and its delegate should operate. If omitted, [NSRunLoop currentRunLoop] is used.
**/
- (NSRunLoop *)onSocket:(AsyncSocket *)sock wantsRunLoopForNewSocket:(AsyncSocket *)newSocket;

/**
 * Called when a socket is about to connect. This method should return YES to continue, or NO to abort.
 * If aborted, will result in AsyncSocketCanceledError.
 * 
 * If the connectToHost:onPort:error: method was called, the delegate will be able to access and configure the
 * CFReadStream and CFWriteStream as desired prior to connection.
 *
 * If the connectToAddress:error: method was called, the delegate will be able to access and configure the
 * CFSocket and CFSocketNativeHandle (BSD socket) as desired prior to connection. You will be able to access and
 * configure the CFReadStream and CFWriteStream in the onSocket:didConnectToHost:port: method.
**/
- (BOOL)onSocketWillConnect:(AsyncSocket *)sock;

/**
 * Called when a socket connects and is ready for reading and writing.
 * The host parameter will be an IP address, not a DNS name.
**/
- (void)onSocket:(AsyncSocket *)sock didConnectToHost:(NSString *)host port:(UInt16)port;

/**
 * Called when a socket has completed reading the requested data into memory.
 * Not called if there is an error.
**/
- (void)onSocket:(AsyncSocket *)sock didReadData:(NSData *)data withTag:(long)tag;

/**
 * Called when a socket has read in data, but has not yet completed the read.
 * This would occur if using readToData: or readToLength: methods.
 * It may be used to for things such as updating progress bars.
**/
- (void)onSocket:(AsyncSocket *)sock didReadPartialDataOfLength:(CFIndex)partialLength tag:(long)tag;

/**
 * Called when a socket has completed writing the requested data. Not called if there is an error.
**/
- (void)onSocket:(AsyncSocket *)sock didWriteDataWithTag:(long)tag;

@end

@interface AsyncSocket : NSObject
{
	CFSocketRef theSocket;             // IPv4 accept or connect socket
	CFSocketRef theSocket6;            // IPv6 accept or connect socket
	CFReadStreamRef theReadStream;
	CFWriteStreamRef theWriteStream;

	CFRunLoopSourceRef theSource;      // For theSocket
	CFRunLoopSourceRef theSource6;     // For theSocket6
	CFRunLoopRef theRunLoop;
	CFSocketContext theContext;

	NSMutableArray *theReadQueue;
	AsyncReadPacket *theCurrentRead;
	NSTimer *theReadTimer;
	NSMutableData *partialReadBuffer;
	
	NSMutableArray *theWriteQueue;
	AsyncWritePacket *theCurrentWrite;
	NSTimer *theWriteTimer;

	id theDelegate;
	Byte theFlags;
	
	long theUserData;
}

- (id)init;
- (id)initWithDelegate:(id)delegate;
- (id)initWithDelegate:(id)delegate userData:(long)userData;

/* String representation is long but has no "\n". */
- (NSString *)description;

/**
 * Use "canSafelySetDelegate" to see if there is any pending business (reads and writes) with the current delegate
 * before changing it.  It is, of course, safe to change the delegate before connecting or accepting connections.
**/
- (id)delegate;
- (BOOL)canSafelySetDelegate;
- (void)setDelegate:(id)delegate;

/* User data can be a long, or an id or void * cast to a long. */
- (long)userData;
- (void)setUserData:(long)userData;

/* Don't use these to read or write. And don't close them, either! */
- (CFSocketRef)getCFSocket;
- (CFReadStreamRef)getCFReadStream;
- (CFWriteStreamRef)getCFWriteStream;

/**
 * Once one of these methods is called, the AsyncSocket instance is locked in, and the rest can't be called without
 * disconnecting the socket first.  If the attempt times out or fails, these methods either return NO or
 * call "onSocket:willDisconnectWithError:" and "onSockedDidDisconnect:".
**/
- (BOOL)acceptOnPort:(UInt16)port error:(NSError **)errPtr;
- (BOOL)acceptOnAddress:(NSString *)hostaddr port:(UInt16)port error:(NSError **)errPtr;
- (BOOL)connectToHost:(NSString *)hostname onPort:(UInt16)port error:(NSError **)errPtr;
- (BOOL)connectToAddress:(NSData *)remoteAddr error:(NSError **)errPtr;

/**
 * Disconnects immediately. Any pending reads or writes are dropped.
**/
- (void)disconnect;

/**
 * Disconnects after all pending writes have completed.
 * After calling this, the read and write methods (including "readDataWithTimeout:tag:") will do nothing.
 * The socket will disconnect even if there are still pending reads.
**/
- (void)disconnectAfterWriting;

/* Returns YES if the socket and streams are open, connected, and ready for reading and writing. */
- (BOOL)isConnected;

/**
 * Returns the local or remote host and port to which this socket is connected, or nil and 0 if not connected.
 * The host will be an IP address.
**/
- (NSString *)connectedHost;
- (UInt16)connectedPort;

- (NSString *)localHost;
- (UInt16)localPort;

- (BOOL)isIPv4;
- (BOOL)isIPv6;

// The readData and writeData methods won't block. To not time out, use a negative time interval.
// If they time out, "onSocket:disconnectWithError:" is called. The tag is for your convenience.
// You can use it as an array index, step number, state id, pointer, etc., just like the socket's user data.

/**
 * This will read a certain number of bytes into memory, and call the delegate method when those bytes have been read.
 * If there is an error, partially read data is lost.
 * If the length is 0, this method does nothing and the delegate is not called.
**/
- (void)readDataToLength:(CFIndex)length withTimeout:(NSTimeInterval)timeout tag:(long)tag;

/**
 * This reads bytes until (and including) the passed "data" parameter, which acts as a separator.
 * The bytes and the separator are returned by the delegate method.
 * 
 * If you pass nil or zero-length data as the "data" parameter,
 * the method will do nothing, and the delegate will not be called.
 * 
 * To read a line from the socket, use the line separator (e.g. CRLF for HTTP, see below) as the "data" parameter.
 * Note that this method is not character-set aware, so if a separator can occur naturally as part of the encoding for
 * a character, the read will prematurely end.
**/
- (void)readDataToData:(NSData *)data withTimeout:(NSTimeInterval)timeout tag:(long)tag;

/**
 * Same as readDataToData:withTimeout:tag, with the additional restriction that the amount of data read
 * may not surpass the given maxLength (specified in bytes).
 * 
 * If you pass a maxLength parameter that is less than the length of the data parameter,
 * the method will do nothing, and the delegate will not be called.
 * 
 * If the max length is surpassed, it is treated the same as a timeout - the socket is closed.
 * 
 * Pass -1 as maxLength if no length restriction is desired, or simply use the readDataToData:withTimeout:tag method.
**/
- (void)readDataToData:(NSData *)data withTimeout:(NSTimeInterval)timeout maxLength:(CFIndex)length tag:(long)tag;

/**
 * Reads the first available bytes that become available on the socket.
**/
- (void)readDataWithTimeout:(NSTimeInterval)timeout tag:(long)tag;

/* Writes data to the socket, and calls the delegate when finished.
 * 
 * If you pass in nil or zero-length data, this method does nothing and the delegate will not be called.
**/
- (void)writeData:(NSData *)data withTimeout:(NSTimeInterval)timeout tag:(long)tag;

/**
 * Returns progress of current read or write, from 0.0 to 1.0, or NaN if no read/write (use isnan() to check).
 * "tag", "done" and "total" will be filled in if they aren't NULL.
**/
- (float)progressOfReadReturningTag:(long *)tag bytesDone:(CFIndex *)done total:(CFIndex *)total;
- (float)progressOfWriteReturningTag:(long *)tag bytesDone:(CFIndex *)done total:(CFIndex *)total;

/**
 * For handling readDataToData requests, data is necessarily read from the socket in small increments.
 * The performance can be improved by allowing AsyncSocket to read larger chunks at a time and
 * store any overflow in a small internal buffer.
 * This is termed pre-buffering, as some data may be read for you before you ask for it.
 * If you use readDataToData a lot, enabling pre-buffering may offer a small performance improvement.
 * 
 * Pre-buffering is disabled by default. You must explicitly enable it to turn it on.
 * 
 * Note: If your protocol negotiates upgrades to TLS (as opposed to using TLS from the start), you should
 * consider how, if at all, pre-buffering could affect the TLS negotiation sequence.
 * This is because TLS runs atop TCP, and requires sending/receiving a TLS handshake over the TCP socket.
 * If the negotiation sequence is poorly designed, pre-buffering could potentially pre-read part of the TLS handshake,
 * thus causing TLS to fail. In almost all cases, especially when implementing a formalized protocol, this will never
 * be a hazard.
**/
- (void)enablePreBuffering;

/**
 * When you create an AsyncSocket, it is added to the runloop of the current thread.
 * So for manually created sockets, it is easiest to simply create the socket on the thread you intend to use it.
 * 
 * If a new socket is accepted, the delegate method onSocket:wantsRunLoopForNewSocket: is called to
 * allow you to place the socket on a separate thread. This works best in conjunction with a thread pool design.
 * 
 * If, however, you need to move the socket to a separate thread at a later time, this
 * method may be used to accomplish the task.
 * 
 * This method must be called from the thread/runloop the socket is currently running on.
 * 
 * Note: After calling this method, all further method calls to this object should be done from the given runloop.
 * Also, all delegate calls will be sent on the given runloop.
**/
- (BOOL)moveToRunLoop:(NSRunLoop *)runLoop;

/**
 * In the event of an error, this method may be called during onSocket:willDisconnectWithError: to read
 * any data that's left on the socket.
**/
- (NSData *)unreadData;

/* A few common line separators, for use with "readDataToData:withTimeout:tag:". */
+ (NSData *)CRLFData;   // 0x0D0A
+ (NSData *)CRData;     // 0x0D
+ (NSData *)LFData;     // 0x0A
+ (NSData *)ZeroData;   // 0x00

@end
