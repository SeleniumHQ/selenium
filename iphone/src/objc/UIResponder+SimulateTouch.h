//
//  UIResponder+SimulateTouch.h
//  iWebDriver
//
//  Created by Joseph Gentle on 1/22/09.
//  Copyright 2009 Google Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

// This category contains a set of methods for simulating touch events on the
// view. It assumes no actual fingers are touching the view at the time the
// simulation occurs.
@interface UIResponder (SimulateTouch)

// Simulate a single tap on a given pixel
- (void)simulateTapAt:(CGPoint)point;

@end
