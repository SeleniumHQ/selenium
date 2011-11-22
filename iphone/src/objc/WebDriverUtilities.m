//
//  WebDriverUtilities.m
//  iWebDriver
//
//  Created by Yu Chen on 5/27/09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <sqlite3.h>
#import "WebDriverUtilities.h"

@implementation WebDriverUtilities

+ (void)cleanCookies{
  NSLog(@"Cleaning up cookies ......");
  NSHTTPCookieStorage* cookieStorage =
    [NSHTTPCookieStorage sharedHTTPCookieStorage];
  NSArray* theCookies = [cookieStorage cookies];
  for (NSHTTPCookie *cookie in theCookies) {
    NSLog(@"Delete cookie: %@", [cookie description]);
    [cookieStorage deleteCookie: cookie];
  }    
  NSLog(@"Finish cleaning up cookies.");
}

+ (void)cleanCache{
  // We use the default sharedCache.
  NSURLCache *sharedCache = [NSURLCache sharedURLCache];
  NSLog(@"Current caching status:");
  NSLog(@"currentDiskUsage: %u Bytes", [sharedCache currentDiskUsage]);
  NSLog(@"currentMemoryUsage: %u Bytes", [sharedCache currentMemoryUsage]);
  NSLog(@"diskCapacity: %u Bytes", [sharedCache diskCapacity]);
  NSLog(@"memoryCapacity: %u Bytes", [sharedCache memoryCapacity]);
  
  [sharedCache removeAllCachedResponses];
  
  NSLog(@"Caching status after clean up:");
  NSLog(@"currentDiskUsage: %u Bytes", [sharedCache currentDiskUsage]);
  NSLog(@"currentMemoryUsage: %u Bytes", [sharedCache currentMemoryUsage]);
  NSLog(@"diskCapacity: %u Bytes", [sharedCache diskCapacity]);
  NSLog(@"memoryCapacity: %u Bytes", [sharedCache memoryCapacity]);
}

+ (void)cleanDatabases{
  // We refer to the logic in webkit/trunk/WebKit/Storage/* Revison 41563
  // (e.g., WebDatabaseManager.mm) and webkit/trunk/WebCore/Storage/* Revision
  // 41578 (e.g., DatabaseTracker.cpp).
  //
  // Webkit uses sqlite database for the HTML 5 databases. A database
  // 'Databases' with tables 'Origins' and 'Databases' is used to store the
  // information of applications' databases. Here we clean databases by deleting
  // data in these two tables and delete the files of databases created by
  // applications.
  
  // Get the path to the database, which is
  // "<user_home_directory>/Library/WebKit/Databases" by default, if not
  // specified in NSUserDefaults with key "WebDatabaseDirectory".
  NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
  NSString *dbDir = [defaults objectForKey:@"WebDatabaseDirectory"];
  if (!dbDir || ![dbDir isKindOfClass:[NSString class]]) {
    dbDir = [NSHomeDirectory()
         stringByAppendingPathComponent:@"/Library/WebKit/Databases"];
  }
  
  NSFileManager *fm = [NSFileManager defaultManager];
  if (!dbDir || ![dbDir isKindOfClass:[NSString class]] ||
    ![fm fileExistsAtPath:dbDir]) {
    return;
  }    
  
  // Clean up database.
  sqlite3 *db;
  NSString *dbFileOfDatabases = [dbDir stringByAppendingPathComponent:@"Databases.db"];
  if ([fm fileExistsAtPath:dbFileOfDatabases]) {
    BOOL succ = FALSE;
    if(sqlite3_open([dbFileOfDatabases UTF8String], &db) == SQLITE_OK) {
      int retOrigins = sqlite3_exec(db, [@"DELETE FROM Origins"  UTF8String], nil, nil, nil);
      int retDatabases = sqlite3_exec(db, [@"DELETE FROM Databases"  UTF8String], nil, nil, nil);
      if (retOrigins == SQLITE_OK && retDatabases == SQLITE_OK) {
        succ = TRUE;
      }
      NSLog(@"Delete tables 'Origins' and 'Databases' (ret: %d, %d).",
          retOrigins, retDatabases);
      sqlite3_close(db);
    }
    
    if (!succ) {
      NSLog(@"Unable to open databse 'Databases'. Delete the database file '%@'",
          dbFileOfDatabases);
      [fm removeItemAtPath:dbFileOfDatabases error:nil];
    }
  }
  
  NSArray *subPaths = [fm subpathsOfDirectoryAtPath: dbDir error:nil];                       
  for (int i = 0; i < [subPaths count]; i++) {
    NSString *path = [dbDir stringByAppendingPathComponent: [subPaths objectAtIndex:i]];
    if ([path isEqualToString:dbFileOfDatabases]) {
      continue;
    }
    NSLog(@"Delete database file %@", path);
    [fm removeItemAtPath:path error:nil];
  } 
}

@end
