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
 * Represents an expected cell of an html table - a string value spanning an
 * indicated amount of columns.
 *
 * @author Jim Weaver
 * @author Paul Hammant (Forked from JWebUnit @ SourceForge)
 */
public class ExpectedCell {

    private int colspan;
    private String expectedValue;

    /**
     * Construct an expected cell with a default colspan of 1.
     * @param expectedValue text expected within the cell.
     */
    public ExpectedCell(String expectedValue) {
        this(expectedValue, 1);
    }

    /**
     * Construct an expected cell with a specified colspan.
     *
     * @param expectedValue text expected within the cell.
     * @param colspan number of columns the cell is expected to span.
     */
    public ExpectedCell(String expectedValue, int colspan) {
        this.expectedValue = expectedValue;
        this.colspan = colspan;
    }

    /**
     * Return the colspan for this cell.
     */
    public int getColspan() {
        return colspan;
    }

    /**
     * Return the expected text for the cell.
     */
    public String getExpectedValue() {
        return expectedValue;
    }

}
