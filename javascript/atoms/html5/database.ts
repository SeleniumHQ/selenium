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
 * @fileoverview Atoms for executing SQL queries on web client database.
 */

import { getWindow } from '../bot';
import { BotError, ErrorCode } from '../error';

// Web SQL Database types (deprecated but still used in some browsers)
interface Database {
  transaction(
    callback: (tx: SQLTransaction) => void,
    errorCallback?: (error: SQLError) => void,
    successCallback?: () => void
  ): void;
}

interface SQLTransaction {
  executeSql(
    sqlStatement: string,
    args?: unknown[],
    callback?: (tx: SQLTransaction, result: SQLResultSet) => void,
    errorCallback?: (tx: SQLTransaction, error: SQLError) => void
  ): void;
}

interface SQLResultSet {
  insertId: number;
  rowsAffected: number;
  rows: SQLResultSetRowList;
}

interface SQLResultSetRowList {
  length: number;
  item(index: number): unknown;
}

interface SQLError {
  code: number;
  message: string;
}

interface WindowWithDatabase extends Window {
  openDatabase?: (
    name: string,
    version: string,
    displayName: string,
    estimatedSize: number
  ) => Database;
}

/**
 * A wrapper of the SQLResultSet object returned by the SQL statement.
 */
export class ResultSet {
  rows: unknown[];
  rowsAffected: number;
  insertId: number;

  constructor(sqlResultSet: SQLResultSet) {
    this.rows = [];
    for (let i = 0; i < sqlResultSet.rows.length; i++) {
      this.rows[i] = sqlResultSet.rows.item(i);
    }

    this.rowsAffected = sqlResultSet.rowsAffected;

    // Originally, accessing insertId attribute of a SQLResultSet object
    // returns the exception INVALID_ACCESS_ERR if no rows are inserted.
    this.insertId = -1;
    try {
      this.insertId = sqlResultSet.insertId;
    } catch (error) {
      // If accessing sqlResultSet.insertId results in INVALID_ACCESS_ERR
      // exception, this.insertId will be assigned to -1.
    }
  }
}

/**
 * Opens the database to access its contents. This function will create the
 * database if it does not exist.
 * @see http://www.w3.org/TR/webdatabase/#databases
 */
export function openOrCreate(
  databaseName: string,
  opt_version?: string,
  opt_displayName?: string,
  opt_size?: number,
  opt_window?: Window
): Database {
  const version = opt_version || '';
  const displayName = opt_displayName || databaseName + 'name';
  const size = opt_size || 5 * 1024 * 1024;
  const win = (opt_window || getWindow()) as WindowWithDatabase;

  if (!win.openDatabase) {
    throw new BotError(ErrorCode.UNKNOWN_ERROR, 'openDatabase is not supported');
  }

  return win.openDatabase(databaseName, version, displayName, size);
}

/**
 * It executes a single SQL query on a given web database storage.
 * @see http://www.w3.org/TR/webdatabase/#executing-sql-statements
 */
export function executeSql(
  databaseName: string,
  query: string,
  args: unknown[],
  queryResultCallback: (tx: SQLTransaction, result: ResultSet) => void,
  txErrorCallback: (error: SQLError) => void,
  opt_txSuccessCallback?: () => void,
  opt_queryErrorCallback?: (tx: SQLTransaction, error: SQLError) => void
): void {
  let db: Database;

  try {
    db = openOrCreate(databaseName);
  } catch (e) {
    throw new BotError(ErrorCode.UNKNOWN_ERROR, (e as Error).message);
  }

  const queryCallback = function (tx: SQLTransaction, result: SQLResultSet): void {
    const wrappedResult = new ResultSet(result);
    queryResultCallback(tx, wrappedResult);
  };

  const transactionCallback = function (tx: SQLTransaction): void {
    tx.executeSql(query, args, queryCallback, opt_queryErrorCallback);
  };

  db.transaction(transactionCallback, txErrorCallback, opt_txSuccessCallback);
}
