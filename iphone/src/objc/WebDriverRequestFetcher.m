//
//  WebDriverRequestFetcher.m
//  iWebDriver
//
//  Created by Yu Chen on 4/16/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//
#import "WebDriverRequestFetcher.h"

#import "HTTPJSONResponse.h"
#import "HTTPRedirectResponse.h"
#import "HTTPResponse+Utility.h"
#import "NSObject+SBJSON.h"
#import "RESTServiceMapping.h"
#import "WebDriverPreferences.h"

// Initial sleeping time interval used by exponential backoff in
// fetching webdriver requests.
static float INIT_SLEEPING_TIME_INTERVAL = 0.05f;
static float MAX_SLEEPING_TIME_INTERVAL = 300;

@implementation WebDriverRequestFetcher

@synthesize serviceMapping = serviceMapping_;
@synthesize viewController = viewController_;
@synthesize status = status_;

static WebDriverRequestFetcher *singleton = nil;
+ (WebDriverRequestFetcher*) sharedInstance {
  if (singleton == nil) {
    singleton = [[WebDriverRequestFetcher alloc] init];
  }	
  return singleton;
}

- (id) init {
  if (![super init]) {
    return nil;
  }

  WebDriverPreferences *preferences = [WebDriverPreferences sharedInstance];
  connectorAddr = [preferences connectorAddr];
  requesterId = [preferences requesterId];
  
  serviceMapping_ = [[RESTServiceMapping alloc] initWithIpAddress:connectorAddr port:3001 ]; 	
  status_ = [[NSString alloc] initWithFormat:@"Driven by requests from %@ routed by %@",
                  requesterId, connectorAddr]; 
  
  // Forks fetching thread.
  [NSThread detachNewThreadSelector:@selector(fetchAndProcessRequests)
                           toTarget:self
                         withObject:nil];
  return self;
}

// The following methods are for fetching/processing/responding webdriver requests.

/*
 * Part I: Utility methods.
 */

// Convertion between JSON data and a dictionary/array.
+ (NSDictionary*) convertJsonDataToDictionary:(NSData*) jsonData {
  NSString *jsonString = [[[NSString alloc] initWithData:jsonData
                                                encoding:NSUTF8StringEncoding] autorelease];
  id jsonDict = [jsonString JSONValue];	
  if (jsonDict == nil || ![jsonDict isKindOfClass:[NSDictionary class]]) {
    NSLog(@"Invalid data - Expecting a dictionary but given '%@'", jsonString);
    return nil;
  }
  return (NSDictionary*) jsonDict;
}

+ (NSData*) convertDictionaryToData:(NSDictionary*) dictionary{
  return [[[NSData alloc] initWithData:
           [[dictionary JSONRepresentation] dataUsingEncoding:NSUTF8StringEncoding]]
          autorelease];
}

+ (NSData*) convertJsonArrayToData:(NSArray*) array{
  return [[[NSData alloc] initWithData:
           [[array JSONRepresentation] dataUsingEncoding:NSUTF8StringEncoding]]
          autorelease];
}

// Return whether a query is to find an element in the form of 
//     /hub/session/%session_id/element
+ (BOOL) isFindElementQuery:(NSString*) query {
  NSArray* pathItems = [query componentsSeparatedByString:@"/"];
  NSString* api = [pathItems lastObject];
  return ([api isEqualToString:@"element"]) && ([pathItems count] == 6);
}

// Send a request to the connector, which always responses with a webdriver request in json 
// representation.
+ (NSDictionary*) sendRequest:(NSURLRequest*) request {
  NSHTTPURLResponse *response;
  NSData* fetchedData = [NSURLConnection sendSynchronousRequest:request
                                              returningResponse:&response
                                                          error:nil];
  if ([response statusCode] != 200) {
    return nil;
  }
  return [WebDriverRequestFetcher convertJsonDataToDictionary:fetchedData];  
}
 
// Get response data from a response.
+ (NSData*) getResponseData:(id<HTTPResponse,NSObject>) response {
  UInt64 contentLength = response ? [response contentLength] : 0;
  return [response readDataOfLength:contentLength]; 
}

// Generate a response body string from a given response data and with the additional information.
+ (NSString*) generateResponseBodyString:(NSData*) data
                       withReqArriveTime:(NSDate*) reqArriveTime
                    withRespSendingSTime:(NSDate*) respSendingSTime {
  // Get the response data in string.
  NSString *cmdRespBodyStr = [[[NSString alloc] initWithData:data
                                                    encoding:NSUTF8StringEncoding] autorelease];
  
  // Add additional information.
  id respBody = [cmdRespBodyStr JSONValue];
  if (respBody != nil && [respBody isKindOfClass:[NSDictionary class]]) {
    NSMutableDictionary* respDict = (NSMutableDictionary *) respBody;
    // Add timing information    
    [respDict setValue:[NSString stringWithFormat:@"%f", [reqArriveTime timeIntervalSince1970]] 
                forKey:@"requestArriveTime"];
    [respDict setValue:[NSString stringWithFormat:@"%f", [respSendingSTime timeIntervalSince1970]]
                forKey:@"responseSendingStartTime"];
    
    // Add cache status.
    NSURLCache* sharedCache = [NSURLCache sharedURLCache];
    [respDict setValue:[NSString stringWithFormat:@"%luB", [sharedCache currentDiskUsage]]
                    forKey:@"currentCacheDiskUsage"];
    [respDict setValue:[NSString stringWithFormat:@"%luB", [sharedCache currentMemoryUsage]]
                    forKey:@"currentCacheMemoryUsage"];
    
    return [respDict JSONRepresentation];
  } else {
    return cmdRespBodyStr;
  }
}

/*
 * Part II: Methods called in each step in processing webdriver requests.
 */

// Parse a webdriver request.
-(void)parseWebDriverRequest:(NSDictionary*)wdRequest
                    queryRef:(NSString **)queryRef
                   methodRef:(NSString **)methodRef
                     dataRef:(NSData **)dataRef
                  actionsRef:(NSArray **)actionsRef{
  // 1. Get method
  *methodRef = [[wdRequest objectForKey:@"Method"] objectAtIndex:0];

  // 2. Get query, which should be the path relative to connectorAddr.
  NSString *urlStr = [[wdRequest objectForKey:@"URL"] objectAtIndex:0];  
  NSString *path = [[[[NSURL alloc] initWithString:urlStr] autorelease] path];
  NSString *connPath = [[[[NSURL alloc] initWithString:connectorAddr] autorelease] path];
  NSRange range = [path rangeOfString:connPath];
  *queryRef = [path substringFromIndex:(range.location + range.length)];
  
  // 3. Get data
  // 3.1 Get dataString and actionsRef (nil) for regular queries.
  NSString* dataString = [[wdRequest objectForKey:@"Body"] objectAtIndex:0];
  *actionsRef = nil;
  
  // 3.2. Get dataString and actions for query findElement, which should be in the form of 
  // [by, value, actions]. An example is ["name", "signIn", [["click", ""]]
  if ([WebDriverRequestFetcher isFindElementQuery:(*queryRef)]) {
    id dataItems = [dataString JSONValue];
    if ([dataItems isKindOfClass:[NSArray class]] && [(NSArray*) dataItems count] >= 3) {
      // Get the data for query findElement.
      NSMutableArray* findElementDataArray = [NSMutableArray arrayWithCapacity:2];
      [findElementDataArray addObject:[dataItems objectAtIndex:0]];
      [findElementDataArray addObject:[dataItems objectAtIndex:1]];
      dataString = [findElementDataArray JSONRepresentation];
      
      // Get actions that will be performed on the found element.
      if ([[dataItems objectAtIndex:2] isKindOfClass:[NSArray class]]) {
        *actionsRef = [NSArray arrayWithArray:(NSArray*) [dataItems objectAtIndex:2]]; 
      }
    }
  }
  
  // 3.3 Generate data
  *dataRef = [[[NSData alloc] 
               initWithData:[dataString dataUsingEncoding:NSUTF8StringEncoding]] autorelease]; 
}

// Process the webdriver request.
-(id<HTTPResponse,NSObject>)httpResponseForQuery:(NSString *)query
                                          method:(NSString *)method
                                            data:(NSData *)data {
  // Create an CFHTTPMessageRef with method, url and bodyData
  CFURLRef baseURL = CFURLCreateWithString(kCFAllocatorDefault, (CFStringRef)connectorAddr, nil);
  CFURLRef cfURL = CFURLCreateWithString(kCFAllocatorDefault, (CFStringRef)query, baseURL);

  CFHTTPMessageRef message = CFHTTPMessageCreateRequest(
      kCFAllocatorDefault, (CFStringRef)method, cfURL, kCFHTTPVersion1_1);
  CFHTTPMessageSetBody(message, (CFDataRef)data);
  
  id<HTTPResponse,NSObject> response = [serviceMapping_ httpResponseForRequest:message];

  // Release data
  CFRelease(baseURL);
  CFRelease(cfURL);
  CFRelease(message);
  
  return response;
}

// Perform actions packed with findElement query.
-(id<HTTPResponse,NSObject>) httpResponseForActions:(NSArray*) actions
                                          onElement:(NSData*) findElementResp{
  NSDictionary* elemResp = [WebDriverRequestFetcher convertJsonDataToDictionary:findElementResp];
  
  // Return nil if no element if found. 
  if ([[elemResp objectForKey:@"error"] boolValue]) {
    return nil;
  }
  
  // Get element information elemInfo (e.g. "element/6") and elemId (e.g., "6"), and the prefix of
  // the queries of actions, which is in the form of /hub/session/1002/foo/element/6
  NSString *elemInfo = [[elemResp objectForKey:@"value"] objectAtIndex:0];
  NSString *elemId = [[elemInfo componentsSeparatedByString:@"/"] objectAtIndex:1]; 
  NSString *queryPrefix = [NSString stringWithFormat:@"/hub/session/%@/%@/", 
                           [elemResp objectForKey:@"sessionId"],
                           elemInfo];
 
  // Perform actions on the found element.
  id<HTTPResponse,NSObject> response;
  NSEnumerator *enumerator = [actions objectEnumerator];
  NSArray* action;
  while (action = (NSArray*)[enumerator nextObject]) {
    // Get action query.
    NSString *query = [queryPrefix stringByAppendingString: [action objectAtIndex:0]];
    
    // Get action data and fill in element id; e.g., '[{"id": "3", "value": ["test1"]}]' 
    // The data is an array of one element, which is a dictionary.
    NSMutableArray* actionDataItems = [NSMutableArray arrayWithCapacity:1];    
    NSString* actionDataString = [action objectAtIndex:1];
    if ([actionDataString isKindOfClass:[NSArray class]]) {
      [actionDataItems addObject:[(NSArray*) actionDataString objectAtIndex:0]];
    } else {
      [actionDataItems addObject:[NSMutableDictionary dictionaryWithCapacity:1]];
    }    
    [[actionDataItems objectAtIndex:0] setValue:elemId forKey:@"id"];    

    NSData *data = [WebDriverRequestFetcher convertJsonArrayToData:actionDataItems];
    
    // Perform action and get response. Note all actions have method "POST".
    response = [self httpResponseForQuery:query method:@"POST" data:data];        
  }
  return response;    
}

// Post the response of the processed webdriver request to the connector.
+(NSDictionary*) sendResponse:(id<HTTPResponse,NSObject>) response
             withResponseBody:(NSString*) cmdRespBodyStr
                           to:(NSURL*) urlSendResponse{
  // 1. Set webdriver response status and headers in cmdRespStatus and cmdRespHeaders.
  NSString *cmdRespStatus = @"200";
  NSMutableDictionary *cmdRespHeaders = [NSMutableDictionary dictionary];	
  [cmdRespHeaders setValue:@"application/json" forKey:@"Content-Type"];

  if (response == nil) {
    cmdRespStatus = @"404";
    [cmdRespHeaders setValue:@"text/plain" forKey:@"Content-Type"];
  } else if ([response isKindOfClass:[HTTPRedirectResponse class]]) {
    // Note header location should be the part relative to connectorAddr. Here we return path.
    cmdRespStatus = @"302";
    [cmdRespHeaders setValue:@"text/plain" forKey:@"Content-Type"];
    NSString* redirectedDest = [(HTTPRedirectResponse* )response destination];
    redirectedDest = [[NSURL URLWithString:redirectedDest] path];
    [cmdRespHeaders setValue:redirectedDest forKey:@"location"];
  } 
	
  // 2. Create a JSON string representation (responseData) of the webdriver response.
  NSMutableDictionary *responseBodyDict = [NSMutableDictionary dictionary];
  [responseBodyDict setValue:cmdRespStatus forKey:@"Status"];
  [responseBodyDict setValue:cmdRespHeaders forKey:@"Headers"];
  [responseBodyDict setValue:cmdRespBodyStr forKey:@"Body"];
  NSData *responseData = [WebDriverRequestFetcher convertDictionaryToData:responseBodyDict];
	
  // 3. Create the request to post response	
  NSMutableURLRequest *requestPostResp = [[[NSMutableURLRequest alloc] initWithURL:urlSendResponse]
                                          autorelease];
  [requestPostResp setHTTPMethod:@"POST"];
  [requestPostResp setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  [requestPostResp setHTTPBody:responseData];
		
  // 4. Send response and fetch the next request.
  return [WebDriverRequestFetcher sendRequest:requestPostResp];
}

/*
 * Part III: Main methods.
 */

// Method that fetches/processes/responses a webdriver request using the above three methods.
// It returns true if there is a webdriver request to be executed, and False otherwise.
- (BOOL) fetchRequestFrom:(NSURL*) urlFetchRequest sendResponseTo:(NSURL*) urlSendResponse{
  NSURLRequest *fetchRequest = [NSURLRequest requestWithURL:urlFetchRequest];
  NSDictionary* wdRequest = [WebDriverRequestFetcher sendRequest:fetchRequest];
  
  BOOL succ = FALSE;  
  while (wdRequest != nil) {
    NSDate* reqArriveTime = [NSDate date];
    
    NSString *query = nil;
    NSString *method = nil;
    NSData *data = nil;
    NSArray *actions = nil; //This is for the actions packed with query "element" (findElement)
    [self parseWebDriverRequest:wdRequest 
                       queryRef:&query 
                      methodRef:&method 
                        dataRef:&data 
                     actionsRef:&actions];
    
    id<HTTPResponse,NSObject> response = [self httpResponseForQuery:query method:method data:data];
    NSData *responseData = [WebDriverRequestFetcher getResponseData:response];
    
    if ([WebDriverRequestFetcher isFindElementQuery:query] && actions != nil && response != nil) {
      id<HTTPResponse,NSObject> actionResponse = 
          [self httpResponseForActions:actions onElement:responseData];
      if (actionResponse !=nil) {
        response = actionResponse;
        responseData = [WebDriverRequestFetcher getResponseData:actionResponse];
      }
    }
    
    // Pack some useful information into the response body.
    NSString *respStr = [WebDriverRequestFetcher generateResponseBodyString:responseData  
                                                          withReqArriveTime:reqArriveTime
                                                       withRespSendingSTime:[NSDate date]];
    
    wdRequest = [WebDriverRequestFetcher sendResponse:response 
                                     withResponseBody:respStr 
                                                   to:urlSendResponse];
    succ = TRUE;
  }
  return succ;
}

//  Main method for fetching and processing requests. 
//  We use exponential backoff if no wedriver request is available.
- (void) fetchAndProcessRequests{
  NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
  
  // Initialize sleeping time interval between fetching webdriver requests.
  float sleepingTimeInterval = 0;

  // Set up urls for fetching webdriver requests and sending webdriver responses.
  NSString* urlStringToServer = [connectorAddr stringByAppendingPathComponent:@"server"];  
  NSString* urlString = [urlStringToServer stringByAppendingPathComponent:
      [NSString stringWithFormat:@"fetch_request?requesterId=%@", requesterId]];
  NSURL* urlFetchRequest = [[[NSURL alloc] initWithString:urlString] autorelease];  
  urlString = [urlStringToServer stringByAppendingPathComponent:
      [NSString stringWithFormat:@"send_response?requesterId=%@", requesterId]];
  NSURL* urlSendResponse = [[[NSURL alloc] initWithString:urlString] autorelease];
	  
  while(TRUE) {    
    BOOL succ = [self fetchRequestFrom:urlFetchRequest sendResponseTo:urlSendResponse];
    if (succ) {
      sleepingTimeInterval = 0;
    } else {
      if (sleepingTimeInterval < INIT_SLEEPING_TIME_INTERVAL*0.5f) {
        sleepingTimeInterval = INIT_SLEEPING_TIME_INTERVAL;
      } else {
        sleepingTimeInterval = 1.2 * sleepingTimeInterval;
        if (sleepingTimeInterval > MAX_SLEEPING_TIME_INTERVAL) {
          sleepingTimeInterval = MAX_SLEEPING_TIME_INTERVAL;
        }
      }
    }
    [NSThread sleepForTimeInterval:sleepingTimeInterval];
  }
  
  [pool release];
}

- (void)dealloc {
  NSLog(@"dealloc of WebdriverRequestFetcher");
	[viewController_ release];
	[serviceMapping_ release];
  [status_ release];
	[super dealloc];
}

@end
