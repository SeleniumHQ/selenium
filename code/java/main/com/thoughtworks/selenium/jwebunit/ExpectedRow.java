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

/**
 * Represents an expected row of an html table.
 *
 * @author Jim Weaver
 * @author Paul Hammant (Forked from JWebUnit @ SourceForge)
 */
public class ExpectedRow {

    private ExpectedCell[] expectedCells;

    /**
     * Construct an expected row from an array of objects which specify the
     * expected cells of the row.  If an object in the array is an
     * {@link ExpectedCell}, it is directly added to
     * the expected cells of the row, otherwise an {@link ExpectedCell}
     * is created from the toString() value of the object and an assumed colspan of 1.
     *
     * @param rowCells objects representing the row's expected cells.
     */
    public ExpectedRow(Object[] rowCells) {
        this.expectedCells = new ExpectedCell[rowCells.length];
        for (int i = 0; i < rowCells.length; i++) {
            Object column = rowCells[i];
            if (column instanceof ExpectedCell) {
                this.expectedCells[i] = (ExpectedCell)column;
            } else {
                this.expectedCells[i] = new ExpectedCell(column.toString(), 1);
            }
        }
    }

    String[] getExpandedColumns() {
        String[] expandedColumns = new String[getNumberOfColumns()];
        int targetColumn = 0;
        for (int i = 0; i < expectedCells.length; i++) {
            targetColumn = expandIntoColumns(expectedCells[i], expandedColumns, targetColumn);
        }
        return expandedColumns;
    }

    private int getNumberOfColumns() {
        int numCols = 0;
        for (int i = 0; i < expectedCells.length; i++) {
            ExpectedCell column = expectedCells[i];
            numCols += (column).getColspan();
        }
        return numCols;
    }

    private int expandIntoColumns(ExpectedCell cell, String[] targetArray, int offset) {
        for (int columnsSpanned = 0; columnsSpanned < cell.getColspan(); columnsSpanned++) {
            targetArray[offset] = cell.getExpectedValue();
            offset++;
        }
        return offset;
    }

}
