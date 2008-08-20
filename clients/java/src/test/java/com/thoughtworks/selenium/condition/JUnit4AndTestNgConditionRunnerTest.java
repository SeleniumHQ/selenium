/*
 * Copyright 2008 ThoughtWorks, Inc.
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
package com.thoughtworks.selenium.condition;

import junit.framework.TestCase;

public class JUnit4AndTestNgConditionRunnerTest extends TestCase {

    public void testAssertionErrorIsOfRightType() {
        JUnit4AndTestNgConditionRunner cr = new JUnit4AndTestNgConditionRunner(null, null, 1, 1);
        try {
            cr.throwAssertionException("foo");
            fail("should have barfed");
        } catch (AssertionError e) {
            assertEquals("foo", e.getMessage());
        }
    }
}
