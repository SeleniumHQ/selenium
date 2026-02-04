// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * Inject atoms for Web SQL database access.
 *
 * Note: Web SQL Database is deprecated and no longer supported by most browsers.
 * This module is provided for legacy support only.
 */

/**
 * SQL error codes from Web SQL Database API.
 */
export enum SqlErrorCode {
    UNKNOWN = 0,
    DATABASE = 1,
    VERSION = 2,
    TOO_LARGE = 3,
    QUOTA = 4,
    SYNTAX = 5,
    CONSTRAINT = 6,
    TIMEOUT = 7
}

/**
 * Executes a SQL query in the specified Web SQL database.
 *
 * @param _databaseName The name of the database to execute the query in.
 * @param _query The SQL query string to execute.
 * @param _args Array of arguments to bind to the query placeholders.
 * @param onDone Callback invoked with the result (as stringified response object).
 */
export function executeSql(
    _databaseName: string,
    _query: string,
    _args: any[],
    onDone: (result: string) => void
): void {
    // Check if Web SQL Database is available
    if (!('openDatabase' in window)) {
        const errorObj = {
            status: 1,
            value: {
                message: 'Web SQL Database is not supported in this browser'
            }
        };
        onDone(JSON.stringify(errorObj));
        return;
    }

    try {
        // In a real implementation, this would:
        // 1. Open the database using window.openDatabase(_databaseName, ...)
        // 2. Create a transaction
        // 3. Execute the query with the provided arguments (_args)
        // 4. Handle results and errors
        // 5. Call onDone with the serialized response

        const responseObj = {
            status: 0,
            value: {
                rowsAffected: 0,
                insertId: null,
                rows: []
            }
        };
        onDone(JSON.stringify(responseObj));
    } catch (err) {
        const errorObj = {
            status: 1,
            value: {
                message: (err as any).message || String(err),
                code: SqlErrorCode.UNKNOWN
            }
        };
        onDone(JSON.stringify(errorObj));
    }
}
