/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium.jwebunit;

import java.util.ArrayList;

/**
 * Represents an expected table for comparison with an actual html table.
 *
 * @author Jim Weaver
 * @author Paul Hammant (Forked from JWebUnit @ SourceForge)
 */
public class ExpectedTable {

    private ArrayList expectedRows = new ArrayList();

    /**
     * Construct an expected table without providing any expecteds; they
     * can be appended subsequently.
     */
    public ExpectedTable() {
    }

    /**
     * Construct an expected table from a two dimensional array of objects.
     * Each object's string value will be used with an expected colspan of 1,
     * unless an object is an {@link ExpectedCell}, in
     * which case its defined value and colspan are used.
     *
     * @param expectedValues two-dimensional array representing expected table cells.
     */
    public ExpectedTable(Object[][] expectedValues) {
        appendRows(expectedValues);
    }

    /**
     * Append any number of expected rows, represented by a two dimensional
     * array of objects.  Each object's string value will be used with an expected colspan of 1,
     * unless an object is an {@link ExpectedCell}, in
     * which case its defined value and colspan are used.
     *
     * @param newExpectedValues two-dimensional array representing expected table cells.
     */
    public void appendRows(Object[][] newExpectedValues) {
        for (int i = 0; i < newExpectedValues.length; i++) {
            expectedRows.add(new ExpectedRow(newExpectedValues[i]));
        }
    }

    /**
     * Append another expected table's rows.
     *
     * @param exptectedTable expected table whose rows are to be appended.
     */
    public void appendRows(ExpectedTable exptectedTable) {
        expectedRows.addAll(exptectedTable.getExpectedRows());
    }

    /**
     * Append a single expected row.
     *
     * @param row row to be appended.
     */
    public void appendRow(ExpectedRow row) {
        expectedRows.add(row);
    }

    /**
     * Return a two dimensional array of strings which represent the
     * expected values.  Cells which have a colspan other than one will
     * occupy a number of positions within a row equal to their colspan.
     * This array is used to compare against the HttpUnit representation
     * of an actual html table.
     *
     */
    public String[][] getExpectedStrings() {
        String[][] asStringArray = new String[expectedRows.size()][];
        for (int i = 0; i < expectedRows.size(); i++) {
            ExpectedRow expectedRow = (ExpectedRow)expectedRows.get(i);
            asStringArray[i] = expectedRow.getExpandedColumns();
        }
        return asStringArray;
    }

    /**
     * Return a brace-delimited, printable version of the expected table
     * for use in assertion failure output or debugging.
     */
    public String toString() {
        StringBuffer asString = new StringBuffer();
        String[][] asStringArray = getExpectedStrings();
        for (int i = 0; i < asStringArray.length; i++) {
            asString.append("{");
            Object[] expectedRow = asStringArray[i];
            for (int j = 0; j < expectedRow.length; j++) {
                asString.append("{");
                String column = (String) expectedRow[j];
                asString.append(column);
                asString.append("}");
            }
            asString.append("}");
        }
        return asString.toString();
    }

    ArrayList getExpectedRows() {
        return expectedRows;
    }

}