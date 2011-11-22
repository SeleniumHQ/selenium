//
//  DisplayPrettyAppDelegate.h
//  DisplayPretty
//
//  Created by Stig Brautaset on 25/05/2011.
//  Copyright 2011 Stig Brautaset. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface DisplayPrettyAppDelegate : NSObject <NSApplicationDelegate> {
@private
    NSWindow *window;
}

@property (assign) IBOutlet NSWindow *window;

@end
