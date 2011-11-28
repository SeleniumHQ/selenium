/*
 Copyright 2010 WebDriver committers
 Copyright 2010 Google Inc.
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

#import "Database.h"
#import "NSException+WebDriver.h"
#import "WebDriverResource.h"
#import "HTTPVirtualDirectory+AccessViewController.h"
#import "errorcodes.h"

static const NSString* kQueryDicKey = @"query";
static const NSString* kQueryArgsDicKey = @"args";
static const NSString* kQueryDatabaseDicKey = @"dbName";

@implementation Database

- (id)init {
  self = [super init];
  if (!self) {
    return nil;
  }
  
  [self setIndex:
   [WebDriverResource resourceWithTarget:self
                               GETAction:NULL
                              POSTAction:@selector(executeSql:)
                               PUTAction:NULL
                            DELETEAction:NULL]];
  return self;
}


// Get HTML5 database path + db name from local db path
// return autoreleased object.
// dbInfo contains 'html5 database name', 'db version', 'db display name' string
- (NSString *)getDatabasePath:(NSString *)dbInfo {
  NSArray* dbInfoItems = [dbInfo componentsSeparatedByString:@","];
  NSString* name = [dbInfoItems objectAtIndex:0];
  NSString* displayName = [dbInfoItems objectAtIndex:2];
  
  sqlite3 *database = NULL;
  NSString *path = @"";
  if ([NSHomeDirectory() length] > 0) {
    NSString *databasePath = [NSHomeDirectory() stringByAppendingPathComponent:
                              @"Library/WebKit/Databases/Databases.db"];
    // Open the database from the users file system
    if (sqlite3_open([databasePath UTF8String], &database) == SQLITE_OK) {
      NSString *sqlStatement = [NSString stringWithFormat:
                                @"select * from Databases where"
                                " name=%@ and displayName=%@;",
                                name, displayName];
      const char* cSqlStatement = [sqlStatement // get query as char *
                                   cStringUsingEncoding:NSUTF8StringEncoding];
      sqlite3_stmt *compiledStatement = NULL;
      if (sqlite3_prepare_v2(database, cSqlStatement, -1, &compiledStatement,
                             NULL) == SQLITE_OK) {
        while (sqlite3_step(compiledStatement) == SQLITE_ROW) {
          NSString *dbSubDir = [NSString stringWithUTF8String:(char *)
                                sqlite3_column_text(compiledStatement, 1)];
          NSString *dbName = [NSString stringWithUTF8String:(char *)
                              sqlite3_column_text(compiledStatement, 5)];
          NSString *dbNameAndPartPath = [NSString stringWithFormat:
                                         @"Library/WebKit/Databases/%@/%@",
                                         dbSubDir, dbName];
          path = [[[NSHomeDirectory() stringByAppendingPathComponent:
                    dbNameAndPartPath] copy] autorelease];
          break;
        }
        if (compiledStatement) {
          sqlite3_finalize(compiledStatement);
        }
      }
      if (database) {
        sqlite3_close(database);
      }
    }
  }
  return path;
}

// Bind arguments to SQL query. We support numeric and text arguments
// it does not support BLOB and VVV. if there is ? argument, we try to
//  pass it as text.
// if we detect error we thow an exception.
- (NSString *)bindArgumentsToQuery:(sqlite3_stmt *)statement
                         arguments:(NSArray *)args{
  NSString *result = @"";
  if (sqlite3_bind_parameter_count(statement) != [args count]) {
    result = @"Bind parameter count doesn't match number of question marks";
    return result;
  }
  for (unsigned i = 1; i <= [args count]; ++i) {
    const char *cBindName = sqlite3_bind_parameter_name(statement, i);
    NSString* argument = [args objectAtIndex:i - 1];
    int bindResult = SQLITE_ERROR;
    // We support only numeric and text arguments at this momemnt.
    if (cBindName == "?NNN") {  // numeric
      NSScanner *sc = [NSScanner scannerWithString:argument];
      if ([sc scanDouble:NULL]) {  // double argument
        double argumentAsDouble = [argument doubleValue];
        bindResult = sqlite3_bind_double(statement, i, argumentAsDouble);
      } else {  // integer argument
        if ([sc scanInt:NULL]) {
          int argumentInt = [argument intValue];
          bindResult = sqlite3_bind_double(statement, i, argumentInt);
        }
      }
    } else {  // "?" without a following integer have no name and are
      // also referred to as "anonymous parameters
      const char* cArgument = [argument cStringUsingEncoding:
                               NSUTF8StringEncoding];
      bindResult = sqlite3_bind_text(statement, i, cArgument, -1,
                                     SQLITE_TRANSIENT);
    }
    if (bindResult != SQLITE_OK) {
      result = [[[NSString stringWithFormat:
                  @"Failed to bind value index %i to statement'", i] copy]
                autorelease];
    }
  }
  return result;
}

- (NSMutableArray *)retrieveRows:(sqlite3_stmt *)statement {
  NSMutableArray *rows = [NSMutableArray array];
  while(sqlite3_step(statement) == SQLITE_ROW) {
    int columnCount = sqlite3_data_count(statement);
    NSMutableDictionary *record = [NSMutableDictionary dictionary];
    
    for(int i = 0; i < columnCount; i++) {
      int columnType = sqlite3_column_type(statement, i);
      const char *cColumnName = sqlite3_column_name(statement, i);
      NSString *columnNameAsKey = [NSString stringWithUTF8String:
                                   cColumnName];
      switch (columnType) {
        case SQLITE_INTEGER: {
          NSNumber *value = [NSNumber numberWithInt:
                             sqlite3_column_int(statement, i)];
          [record setObject:value forKey:columnNameAsKey];
        } break;
        case SQLITE_FLOAT: {
          NSNumber *value = [NSNumber numberWithFloat:
                             sqlite3_column_double(statement, i)];
          [record setObject:value forKey:columnNameAsKey];
        } break;
        case SQLITE3_TEXT: {
          NSString *value = [NSString stringWithUTF8String:(char *)
                             sqlite3_column_text(statement, i)];
          [record setObject:value forKey:columnNameAsKey];
        } break;
        default: {
          // return nil string for unsupported type
          [record setObject:@"" forKey:columnNameAsKey];
        }
          break;
      } //end of switch
    }  // end of columns loop
    [rows addObject:record];
  }  // end of record loop
  return rows;
}

- (NSDictionary *)executeSql:(NSDictionary *)dict {
  NSString *query = [dict objectForKey:kQueryDicKey];
  NSArray *arguments = [dict objectForKey:kQueryArgsDicKey];  // query arguments
  NSString *dbInfo = [dict objectForKey:kQueryDatabaseDicKey];
  NSString *dbPathAndName = [self getDatabasePath:dbInfo];
  
  NSMutableDictionary *resultSet;
  sqlite3 *database = NULL;
  
  if ([dbPathAndName length] > 0) {
    // Open the database from the users file system
    if(sqlite3_open([dbPathAndName UTF8String], &database) == SQLITE_OK) {
      const char* cSqlStatement = [query cStringUsingEncoding:
                                   NSUTF8StringEncoding];
      sqlite3_stmt *statement = NULL;
      if(sqlite3_prepare_v2(database, cSqlStatement, -1, &statement,
                            NULL) == SQLITE_OK) {
        NSString *msgResult = [self bindArgumentsToQuery:statement
                                               arguments:arguments];
        if ([msgResult length] > 0) {  // could not bind args, throw except-n
          if (statement) sqlite3_finalize(statement);
          if (database) sqlite3_close(database);
          @throw [NSException webDriverExceptionWithMessage:msgResult
                                              andStatusCode:EUNHANDLEDERROR];
        }
        
        NSMutableArray *rows = [self retrieveRows:statement];
        
        int lastInsertedRowId = sqlite3_last_insert_rowid(database);
        int rowsAffected = sqlite3_changes(database);
        
        if (lastInsertedRowId == 0) {
          lastInsertedRowId = -1;
        }
        
        resultSet = [NSMutableDictionary dictionaryWithObjectsAndKeys:
                     [NSNumber numberWithInt:lastInsertedRowId], @"insertId",
                     [NSNumber numberWithInt:rowsAffected], @"rowsAffected",
                     rows, @"rows",
                     nil];
        
        if (statement) {
          sqlite3_finalize(statement);
        }
      }  // end of prepare sql request
    } else {  // end of process html5 db
      NSString *message = @"Could not find HTML5 database, check name and display name.";
      @throw [NSException webDriverExceptionWithMessage:message
                                          andStatusCode:EUNHANDLEDERROR];
    }
  } else {
    NSString *message = @"Could not find local Database.db.";
    @throw [NSException webDriverExceptionWithMessage:message
                                        andStatusCode:EUNHANDLEDERROR];
  }
  if (database) {
    sqlite3_close(database);
  }
  return resultSet;
}

@end
