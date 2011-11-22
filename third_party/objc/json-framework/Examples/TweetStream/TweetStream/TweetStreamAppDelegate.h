//
//  TweetStreamAppDelegate.h
//  TweetStream
//
//  Created by Stig Brautaset on 24/05/2011.
//  Copyright 2011 Stig Brautaset. All rights reserved.
//

#import <UIKit/UIKit.h>

@class TweetStreamViewController;

@interface TweetStreamAppDelegate : NSObject <UIApplicationDelegate> {

}

@property (nonatomic, retain) IBOutlet UIWindow *window;

@property (nonatomic, retain) IBOutlet TweetStreamViewController *viewController;

@end
