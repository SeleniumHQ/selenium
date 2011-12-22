#import <libxml/parser.h>

#import "DAVResponse.h"
#import "HTTPLogging.h"

// WebDAV specifications: http://webdav.org/specs/rfc4918.html

typedef enum {
  kDAVProperty_ResourceType = (1 << 0),
  kDAVProperty_CreationDate = (1 << 1),
  kDAVProperty_LastModified = (1 << 2),
  kDAVProperty_ContentLength = (1 << 3),
  kDAVAllProperties = kDAVProperty_ResourceType | kDAVProperty_CreationDate | kDAVProperty_LastModified | kDAVProperty_ContentLength
} DAVProperties;

#define kXMLParseOptions (XML_PARSE_NONET | XML_PARSE_RECOVER | XML_PARSE_NOBLANKS | XML_PARSE_COMPACT | XML_PARSE_NOWARNING | XML_PARSE_NOERROR)

static const int httpLogLevel = HTTP_LOG_LEVEL_WARN;

@implementation DAVResponse

static void _AddPropertyResponse(NSString* itemPath, NSString* resourcePath, DAVProperties properties, NSMutableString* xmlString) {
  CFStringRef escapedPath = CFURLCreateStringByAddingPercentEscapes(kCFAllocatorDefault, (CFStringRef)resourcePath, NULL,
                                                                    CFSTR("<&>?+"), kCFStringEncodingUTF8);
  if (escapedPath) {
    NSDictionary* attributes = [[NSFileManager defaultManager] attributesOfItemAtPath:itemPath error:NULL];
    BOOL isDirectory = [[attributes fileType] isEqualToString:NSFileTypeDirectory];
    [xmlString appendString:@"<D:response>"];
      [xmlString appendFormat:@"<D:href>%@</D:href>", escapedPath];
      [xmlString appendString:@"<D:propstat>"];
        [xmlString appendString:@"<D:prop>"];
        
          if (properties & kDAVProperty_ResourceType) {
            if (isDirectory) {
              [xmlString appendString:@"<D:resourcetype><D:collection/></D:resourcetype>"];
            } else {
              [xmlString appendString:@"<D:resourcetype/>"];
            }
          }
          
          if ((properties & kDAVProperty_CreationDate) && [attributes objectForKey:NSFileCreationDate]) {
            NSDateFormatter* formatter = [[NSDateFormatter alloc] init];
            formatter.locale = [[[NSLocale alloc] initWithLocaleIdentifier:@"en_US"] autorelease];
            formatter.timeZone = [NSTimeZone timeZoneWithName:@"GMT"];
            formatter.dateFormat = @"yyyy-MM-dd'T'HH:mm:ss'+00:00'";
            [xmlString appendFormat:@"<D:creationdate>%@</D:creationdate>", [formatter stringFromDate:[attributes fileCreationDate]]];
            [formatter release];
          }
          
          if ((properties & kDAVProperty_LastModified) && [attributes objectForKey:NSFileModificationDate]) {
            NSDateFormatter* formatter = [[NSDateFormatter alloc] init];
            formatter.locale = [[[NSLocale alloc] initWithLocaleIdentifier:@"en_US"] autorelease];
            formatter.timeZone = [NSTimeZone timeZoneWithName:@"GMT"];
            formatter.dateFormat = @"EEE', 'd' 'MMM' 'yyyy' 'HH:mm:ss' GMT'";
            [xmlString appendFormat:@"<D:getlastmodified>%@</D:getlastmodified>", [formatter stringFromDate:[attributes fileModificationDate]]];
            [formatter release];
          }
          
          if ((properties & kDAVProperty_ContentLength) && !isDirectory && [attributes objectForKey:NSFileSize]) {
            [xmlString appendFormat:@"<D:getcontentlength>%qu</D:getcontentlength>", [attributes fileSize]];
          }
        
        [xmlString appendString:@"</D:prop>"];
        [xmlString appendString:@"<D:status>HTTP/1.1 200 OK</D:status>"];
      [xmlString appendString:@"</D:propstat>"];
    [xmlString appendString:@"</D:response>\n"];
    CFRelease(escapedPath);
  }
}

static xmlNodePtr _XMLChildWithName(xmlNodePtr child, const xmlChar* name) {
  while (child) {
    if ((child->type == XML_ELEMENT_NODE) && !xmlStrcmp(child->name, name)) {
      return child;
    }
    child = child->next;
  }
  return NULL;
}

- (id) initWithMethod:(NSString*)method headers:(NSDictionary*)headers bodyData:(NSData*)body resourcePath:(NSString*)resourcePath rootPath:(NSString*)rootPath {
  if ((self = [super init])) {
    _status = 200;
    _headers = [[NSMutableDictionary alloc] init];
    
    // 10.1 DAV Header
    if ([method isEqualToString:@"OPTIONS"]) {
      if ([[headers objectForKey:@"User-Agent"] hasPrefix:@"WebDAVFS/"]) {  // Mac OS X WebDAV support
        [_headers setObject:@"1, 2" forKey:@"DAV"];
      } else {
        [_headers setObject:@"1" forKey:@"DAV"];
      }
    }
    
    // 9.1 PROPFIND Method
    if ([method isEqualToString:@"PROPFIND"]) {
      NSInteger depth;
      NSString* depthHeader = [headers objectForKey:@"Depth"];
      if ([depthHeader isEqualToString:@"0"]) {
        depth = 0;
      } else if ([depthHeader isEqualToString:@"1"]) {
        depth = 1;
      } else {
        HTTPLogError(@"Unsupported DAV depth \"%@\"", depthHeader);
        [self release];
        return nil;
      }
      
      DAVProperties properties = 0;
      xmlDocPtr document = xmlReadMemory(body.bytes, (int)body.length, NULL, NULL, kXMLParseOptions);
      if (document) {
        xmlNodePtr node = _XMLChildWithName(document->children, (const xmlChar*)"propfind");
        if (node) {
          node = _XMLChildWithName(node->children, (const xmlChar*)"prop");
        }
        if (node) {
          node = node->children;
          while (node) {
            if (!xmlStrcmp(node->name, (const xmlChar*)"resourcetype")) {
              properties |= kDAVProperty_ResourceType;
            } else if (!xmlStrcmp(node->name, (const xmlChar*)"creationdate")) {
              properties |= kDAVProperty_CreationDate;
            } else if (!xmlStrcmp(node->name, (const xmlChar*)"getlastmodified")) {
              properties |= kDAVProperty_LastModified;
            } else if (!xmlStrcmp(node->name, (const xmlChar*)"getcontentlength")) {
              properties |= kDAVProperty_ContentLength;
            } else {
              HTTPLogWarn(@"Unknown DAV property requested \"%s\"", node->name);
            }
            node = node->next;
          }
        } else {
          HTTPLogWarn(@"HTTP Server: Invalid DAV properties\n%@", [[[NSString alloc] initWithData:body encoding:NSUTF8StringEncoding] autorelease]);
        }
        xmlFreeDoc(document);
      }
      if (!properties) {
        properties = kDAVAllProperties;
      }
      
      NSString* basePath = [rootPath stringByAppendingPathComponent:resourcePath];
      if (![basePath hasPrefix:rootPath] || ![[NSFileManager defaultManager] fileExistsAtPath:basePath]) {
        [self release];
        return nil;
      }
      
      NSMutableString* xmlString = [NSMutableString stringWithString:@"<?xml version=\"1.0\" encoding=\"utf-8\" ?>"];
      [xmlString appendString:@"<D:multistatus xmlns:D=\"DAV:\">\n"];
      if (![resourcePath hasPrefix:@"/"]) {
        resourcePath = [@"/" stringByAppendingString:resourcePath];
      }
      _AddPropertyResponse(basePath, resourcePath, properties, xmlString);
      if (depth == 1) {
        if (![resourcePath hasSuffix:@"/"]) {
          resourcePath = [resourcePath stringByAppendingString:@"/"];
        }
        NSDirectoryEnumerator* enumerator = [[NSFileManager defaultManager] enumeratorAtPath:basePath];
        NSString* path;
        while ((path = [enumerator nextObject])) {
          _AddPropertyResponse([basePath stringByAppendingPathComponent:path], [resourcePath stringByAppendingString:path], properties, xmlString);
          [enumerator skipDescendents];
        }
      }
      [xmlString appendString:@"</D:multistatus>"];
      
      [_headers setObject:@"application/xml; charset=\"utf-8\"" forKey:@"Content-Type"];
      _data = [[xmlString dataUsingEncoding:NSUTF8StringEncoding] retain];
      _status = 207;
    }
    
    // 9.3 MKCOL Method
    if ([method isEqualToString:@"MKCOL"]) {
      NSString* path = [rootPath stringByAppendingPathComponent:resourcePath];
      if (![path hasPrefix:rootPath]) {
        [self release];
        return nil;
      }
      
      if (![[NSFileManager defaultManager] fileExistsAtPath:[path stringByDeletingLastPathComponent]]) {
        HTTPLogError(@"Missing intermediate collection(s) at \"%@\"", path);
        _status = 409;
      } else if (![[NSFileManager defaultManager] createDirectoryAtPath:path withIntermediateDirectories:NO attributes:nil error:NULL]) {
        HTTPLogError(@"Failed creating collection at \"%@\"", path);
        _status = 405;
      }
    }
    
    // 9.8 COPY Method
    // 9.9 MOVE Method
    if ([method isEqualToString:@"MOVE"] || [method isEqualToString:@"COPY"]) {
      if ([method isEqualToString:@"COPY"] && ![[headers objectForKey:@"Depth"] isEqualToString:@"infinity"]) {
        HTTPLogError(@"Unsupported DAV depth \"%@\"", [headers objectForKey:@"Depth"]);
        [self release];
        return nil;
      }
      
      NSString* sourcePath = [rootPath stringByAppendingPathComponent:resourcePath];
      if (![sourcePath hasPrefix:rootPath] || ![[NSFileManager defaultManager] fileExistsAtPath:sourcePath]) {
        [self release];
        return nil;
      }
      
      NSString* destination = [headers objectForKey:@"Destination"];
      NSRange range = [destination rangeOfString:[headers objectForKey:@"Host"]];
      if (range.location == NSNotFound) {
        [self release];
        return nil;
      }
      NSString* destinationPath = [rootPath stringByAppendingPathComponent:
        [[destination substringFromIndex:(range.location + range.length)] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
      if (![destinationPath hasPrefix:rootPath] || [[NSFileManager defaultManager] fileExistsAtPath:destinationPath]) {
        [self release];
        return nil;
      }
      
      BOOL isDirectory;
      if (![[NSFileManager defaultManager] fileExistsAtPath:[destinationPath stringByDeletingLastPathComponent] isDirectory:&isDirectory] || !isDirectory) {
        HTTPLogError(@"Invalid destination path \"%@\"", destinationPath);
        _status = 409;
      } else {
        BOOL existing = [[NSFileManager defaultManager] fileExistsAtPath:destinationPath];
        if (existing && [[headers objectForKey:@"Overwrite"] isEqualToString:@"F"]) {
          HTTPLogError(@"Pre-existing destination path \"%@\"", destinationPath);
          _status = 412;
        } else {
          if ([method isEqualToString:@"COPY"]) {
            if ([[NSFileManager defaultManager] copyItemAtPath:sourcePath toPath:destinationPath error:NULL]) {
              _status = existing ? 204 : 201;
            } else {
              HTTPLogError(@"Failed copying \"%@\" to \"%@\"", sourcePath, destinationPath);
              _status = 403;
            }
          } else {
            if ([[NSFileManager defaultManager] moveItemAtPath:sourcePath toPath:destinationPath error:NULL]) {
              _status = existing ? 204 : 201;
            } else {
              HTTPLogError(@"Failed moving \"%@\" to \"%@\"", sourcePath, destinationPath);
              _status = 403;
            }
          }
        }
      }
    }
    
    // 9.10 LOCK Method - TODO: Actually lock the resource
    if ([method isEqualToString:@"LOCK"]) {
      NSString* path = [rootPath stringByAppendingPathComponent:resourcePath];
      if (![path hasPrefix:rootPath]) {
        [self release];
        return nil;
      }
      
      NSString* depth = [headers objectForKey:@"Depth"];
      NSString* scope = nil;
      NSString* type = nil;
      NSString* owner = nil;
      xmlDocPtr document = xmlReadMemory(body.bytes, (int)body.length, NULL, NULL, kXMLParseOptions);
      if (document) {
        xmlNodePtr node = _XMLChildWithName(document->children, (const xmlChar*)"lockinfo");
        if (node) {
          xmlNodePtr scopeNode = _XMLChildWithName(node->children, (const xmlChar*)"lockscope");
          if (scopeNode && scopeNode->children && scopeNode->children->name) {
            scope = [NSString stringWithUTF8String:(const char*)scopeNode->children->name];
          }
          xmlNodePtr typeNode = _XMLChildWithName(node->children, (const xmlChar*)"locktype");
          if (typeNode && typeNode->children && typeNode->children->name) {
            type = [NSString stringWithUTF8String:(const char*)typeNode->children->name];
          }
          xmlNodePtr ownerNode = _XMLChildWithName(node->children, (const xmlChar*)"owner");
          if (ownerNode) {
            ownerNode = _XMLChildWithName(ownerNode->children, (const xmlChar*)"href");
            if (ownerNode && ownerNode->children && ownerNode->children->content) {
              owner = [NSString stringWithUTF8String:(const char*)ownerNode->children->content];
            }
          }
        } else {
          HTTPLogWarn(@"HTTP Server: Invalid DAV properties\n%@", [[[NSString alloc] initWithData:body encoding:NSUTF8StringEncoding] autorelease]);
        }
        xmlFreeDoc(document);
      }
      if ([scope isEqualToString:@"exclusive"] && [type isEqualToString:@"write"] && [depth isEqualToString:@"0"] &&
        ([[NSFileManager defaultManager] fileExistsAtPath:path] || [[NSData data] writeToFile:path atomically:YES])) {
        NSString* timeout = [headers objectForKey:@"Timeout"];
        
        CFUUIDRef uuid = CFUUIDCreate(kCFAllocatorDefault);
        NSString* token = [NSString stringWithFormat:@"urn:uuid:%@", [(id)CFUUIDCreateString(kCFAllocatorDefault, uuid) autorelease]];
        CFRelease(uuid);
        
        NSMutableString* xmlString = [NSMutableString stringWithString:@"<?xml version=\"1.0\" encoding=\"utf-8\" ?>"];
        [xmlString appendString:@"<D:prop xmlns:D=\"DAV:\">\n"];
        [xmlString appendString:@"<D:lockdiscovery>\n<D:activelock>\n"];
        [xmlString appendFormat:@"<D:locktype><D:%@/></D:locktype>\n", type];
        [xmlString appendFormat:@"<D:lockscope><D:%@/></D:lockscope>\n", scope];
        [xmlString appendFormat:@"<D:depth>%@</D:depth>\n", depth];
        if (owner) {
          [xmlString appendFormat:@"<D:owner><D:href>%@</D:href></D:owner>\n", owner];
        }
        if (timeout) {
          [xmlString appendFormat:@"<D:timeout>%@</D:timeout>\n", timeout];
        }
        [xmlString appendFormat:@"<D:locktoken><D:href>%@</D:href></D:locktoken>\n", token];
        // [xmlString appendFormat:@"<D:lockroot><D:href>%@</D:href></D:lockroot>\n", root];
        [xmlString appendString:@"</D:activelock>\n</D:lockdiscovery>\n"];
        [xmlString appendString:@"</D:prop>"];
        
        [_headers setObject:@"application/xml; charset=\"utf-8\"" forKey:@"Content-Type"];
        _data = [[xmlString dataUsingEncoding:NSUTF8StringEncoding] retain];
        _status = 200;
        HTTPLogVerbose(@"Pretending to lock \"%@\"", resourcePath);
      } else {
        HTTPLogError(@"Locking request \"%@/%@/%@\" for \"%@\" is not allowed", scope, type, depth, resourcePath);
        _status = 403;
      }
    }
    
    // 9.11 UNLOCK Method - TODO: Actually unlock the resource
    if ([method isEqualToString:@"UNLOCK"]) {
      NSString* path = [rootPath stringByAppendingPathComponent:resourcePath];
      if (![path hasPrefix:rootPath] || ![[NSFileManager defaultManager] fileExistsAtPath:path]) {
        [self release];
        return nil;
      }
      
      NSString* token = [headers objectForKey:@"Lock-Token"];
      _status = token ? 204 : 400;
      HTTPLogVerbose(@"Pretending to unlock \"%@\"", resourcePath);
    }
    
  }
  return self;
}

- (void) dealloc {
  [_headers release];
  [_data release];
  
  [super dealloc];
}

- (UInt64) contentLength {
  return _data ? _data.length : 0;
}

- (UInt64) offset {
  return _offset;
}

- (void) setOffset:(UInt64)offset {
  _offset = offset;
}

- (NSData*) readDataOfLength:(NSUInteger)lengthParameter {
  if (_data) {
    NSUInteger remaining = _data.length - (NSUInteger)_offset;
    NSUInteger length = lengthParameter < remaining ? lengthParameter : remaining;
    void* bytes = (void*)(_data.bytes + _offset);
    _offset += length;
    return [NSData dataWithBytesNoCopy:bytes length:length freeWhenDone:NO];
  }
  return nil;
}

- (BOOL) isDone {
  return _data ? _offset == _data.length : YES;
}

- (NSInteger) status {
  return _status;
}

- (NSDictionary*) httpHeaders {
  return _headers;
}

@end
