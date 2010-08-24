//
//  RootViewController.m
//  iWebDriver
//
//  This file is based on a template provided by Apple Computers. Except for
//  code provided by apple, this is copyright 2009 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

#import "RootViewController.h"
#import "MainViewController.h"
#import "FlipsideViewController.h"
#import "HTTPServerController.h"
#import "HTTPResponse+Utility.h"


@implementation RootViewController

@synthesize infoButton;
@synthesize flipsideNavigationBar;
@synthesize mainViewController;
@synthesize flipsideViewController;
@synthesize swAuto;
@synthesize lblAutoSession;

// This is all boilerplate apple template code.

static RootViewController *singleton_;
BOOL isAutoCreateSession_ = YES;

- (BOOL)isIPad {
  BOOL IPAD = NO;
#ifdef UI_USER_INTERFACE_IDIOM
  IPAD = (UI_USER_INTERFACE_IDIOM() == UIUserInterfaceIdiomPad);
#endif
  return IPAD;
}

- (void)viewDidLoad {

  [super viewDidLoad];
  MainViewController *viewController;
	
  if (self.isIPad) {
    viewController = [[MainViewController alloc]
                                          initWithNibName:@"MainView-iPad"
                                          bundle:nil];
  } else {
    viewController = [[MainViewController alloc]
                                          initWithNibName:@"MainView"
                                          bundle:nil];
  }

  self.mainViewController = viewController;
  [viewController release];
  
  singleton_ = self;

  [self.view insertSubview:mainViewController.view belowSubview:infoButton];
}

+ (RootViewController *)sharedInstance {
  return singleton_;
}

- (BOOL)isAutoCreateSession {
  return isAutoCreateSession_;
}

- (void)loadFlipsideViewController {
  FlipsideViewController *viewController;
  
  if (self.isIPad) {
    viewController = [[FlipsideViewController alloc]
                                              initWithNibName:@"FlipsideView-iPad"
                                              bundle:nil];
  } else {
    viewController = [[FlipsideViewController alloc]
                                              initWithNibName:@"FlipsideView"
                                              bundle:nil];
  }

    
  
  self.flipsideViewController = viewController;
  [viewController release];
  
  // Set up the navigation bar
  UINavigationBar *aNavigationBar = 
    [[UINavigationBar alloc] initWithFrame:CGRectMake(0.0, 0.0, self.view.frame.size.width, 44.0)];
  aNavigationBar.barStyle = UIBarStyleBlackOpaque;
  self.flipsideNavigationBar = aNavigationBar;
  [aNavigationBar release];
  
  UIBarButtonItem *buttonItem =
    [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone 
                                                  target:self
                                                  action:@selector(toggleView)];
	
  UISwitch *switchAutoSession = [[UISwitch alloc]
								   initWithFrame:CGRectMake(206.0, 65.0, self.view.frame.size.width, self.view.frame.size.height)];
	[switchAutoSession addTarget:self action:@selector(toggleAutoCreateSession)
							forControlEvents:UIControlEventValueChanged];
	[switchAutoSession setOn:YES];
	self.swAuto = switchAutoSession;
	[switchAutoSession release];
	
  UILabel *labelAutoSession = [[UILabel alloc]
                        initWithFrame:CGRectMake(12.0, 68.0, 179.0, 21.0)];
  [labelAutoSession setText:@"Auto-create session:"];
  [labelAutoSession setTextColor:[UIColor whiteColor]];
  [labelAutoSession setBackgroundColor:[UIColor viewFlipsideBackgroundColor]];
  self.lblAutoSession = labelAutoSession;
  [labelAutoSession release];
	
  UINavigationItem *navigationItem =
    [[UINavigationItem alloc] initWithTitle:@"Details"];
  navigationItem.rightBarButtonItem = buttonItem;

  [flipsideNavigationBar pushNavigationItem:navigationItem animated:NO];
  [navigationItem release];
  [buttonItem release];
}

- (IBAction)toggleAutoCreateSession	{
  isAutoCreateSession_ = [self.swAuto isOn];
}

- (IBAction)toggleView {    
  /*
   This method is called when the info or Done button is pressed.
   It flips the displayed view from the main view to the flipside view and
   vice-versa.
   */
  if (flipsideViewController == nil) {
    [self loadFlipsideViewController];
  }
  
  UIView *mainView = mainViewController.view;
  UIView *flipsideView = flipsideViewController.view;
  
  [UIView beginAnimations:nil context:NULL];
  [UIView setAnimationDuration:1];
  [UIView setAnimationTransition:
   ([mainView superview] ? UIViewAnimationTransitionFlipFromRight
    : UIViewAnimationTransitionFlipFromLeft) 
                         forView:self.view
                           cache:YES];
  
  if ([mainView superview] != nil) {
    [flipsideViewController viewWillAppear:YES];
    [mainViewController viewWillDisappear:YES];
    [mainView removeFromSuperview];
    [infoButton removeFromSuperview];
    [self.view addSubview:flipsideView];
    [self.view insertSubview:flipsideNavigationBar aboveSubview:flipsideView];
    [self.view insertSubview:swAuto aboveSubview:flipsideView];
    [self.view insertSubview:lblAutoSession aboveSubview:flipsideView];
    [mainViewController viewDidDisappear:YES];
    [flipsideViewController viewDidAppear:YES];

  } else {
    [mainViewController viewWillAppear:YES];
    [flipsideViewController viewWillDisappear:YES];
    [flipsideView removeFromSuperview];
    [flipsideNavigationBar removeFromSuperview];
    [self.view addSubview:mainView];
    [self.view insertSubview:infoButton aboveSubview:mainViewController.view];
    [flipsideViewController viewDidDisappear:YES];
    [mainViewController viewDidAppear:YES];
  }
  [UIView commitAnimations];
}


// Override to allow orientations other than the default portrait orientation.
- (BOOL)shouldAutorotateToInterfaceOrientation:
          (UIInterfaceOrientation)interfaceOrientation {
    // Return YES for supported orientations
    return YES;
}


- (void)didReceiveMemoryWarning {
  [super didReceiveMemoryWarning];
}


- (void)dealloc {
  [infoButton release];
  [flipsideNavigationBar release];
  [mainViewController release];
  [flipsideViewController release];
  [super dealloc];
}


@end
