//
//  VirtualDirectory.h
//  iWebDriver
//
//  Created by Joseph Gentle on 12/4/08.
//  Copyright 2008 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HTTPResource.h"

// A VirtualDirectory represents a particular directory in the URL heirachy.
// It does not need to be mapped by actual files.
@interface HTTPVirtualDirectory : NSObject<HTTPResource> {
	// This maps virtual subdirectory -> HTTPResource element
	NSMutableDictionary *contents;
	
	// The index (or root) element of the directory
	id<HTTPResource> index;
	
	// If this is set, it redirects /foo/self to /foo/self/
	// If this is not set, /foo/self returns index.
	BOOL redirectBaseToIndex;
}

// The index of the vdir. This will be returnd on .../vdir/ and .../vdir
// You can make this a redirect to index.html or something if you want.
@property (nonatomic, retain) id<HTTPResource> index;

// Do we redirect /foo/self to /foo/self/ or just return index?
@property (nonatomic) BOOL redirectBaseToIndex;

// Make and return an autoreleased VirtualDirectory
+ (HTTPVirtualDirectory *)virtualDirectory;

// Set a virtual file in the virtual directory. if resource is nil, element
// is deleted.
// resource is retained as expected.
- (void)setResource:(id<HTTPResource>)resource withName:(NSString *)name;

@end
