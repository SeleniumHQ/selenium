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

import junit.framework.AssertionFailedError;
import junit.framework.TestCase;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

/**
 * Test for Condition class.
 */
public class ConditionTest extends TestCase {

    private static final ConditionRunner conditionRunner =
            new JUnitConditionRunner(null, 1, 100);

    public void testAppendsInfoToFailureMessage() throws Exception {
        try {
            conditionRunner.waitFor("this condition should always fail", new AlwaysFalseCondition());
            fail("the condition should have failed");
        } catch (AssertionFailedError expected) {
            assertEquals("Condition \"Sky should be blue\" failed to become true within 100 msec; " +
                    "this condition should always fail; [sky is in fact pink]", expected.getMessage());
        }
    }

    public void testNotCanInvertFailingSituationQuickly() throws Exception {
        Condition alwaysFalse = new AlwaysFalseCondition();
        long start = System.currentTimeMillis();
        final StringBuilder sb = new StringBuilder();
        alwaysFalse.isTrue(new ConditionRunner.Context(){
            public ConditionRunner getConditionRunner() {
                return null;
            }

            public Selenium getSelenium() {
                return null;
            }

            public void info(String string) {
                sb.append(string);
            }

            public long elapsed() {
                return 0;
            }
        });
        new JUnitConditionRunner(null, 0, 1000, 100000).waitFor(new Not(alwaysFalse));
        assertTrue(System.currentTimeMillis() - start < 100);
        assertEquals("sky is in fact pink", sb.toString()); 
    }

    public void testNotCanNegatePassingSituationAfterTimeout() throws Exception {
        Condition alwaysTrue = new AlwaysTrueCondition();
        long start = System.currentTimeMillis();
        try {
            new JUnitConditionRunner(null, 0, 1000, 1000).waitFor(new Not(alwaysTrue));
            fail("the condition should have failed");
        } catch (AssertionFailedError expected) {
            long l = System.currentTimeMillis() - start;
            assertTrue(l >= 1000);
            assertEquals("Condition \"NOT of (Condition \"Sky should be blue\")\" failed to become true within 1000 msec; [yes it is really is blue]", expected.getMessage());
        }
    }

    public void testCanTurnTrueBeforeTimeout() throws Exception {
        long start = System.currentTimeMillis();
        final int[] time = new int[1];
        JUnitConditionRunner conditionRunner1 = new JUnitConditionRunner(null, 0, 100, 2000);
        conditionRunner1.waitFor(new Condition() {
            public boolean isTrue(ConditionRunner.Context runner) {
                return time[0]++ >= 12;
            }
        });
        long l = System.currentTimeMillis() - start;
        assertTrue(l >= 1200); // is waiting at least 12 * 100 milliseconds
        assertTrue(l < 2000); // but timing out before 2000 milliseconds
    }

    public void testCannotTurnTrueAfterTimeout() throws Exception {
        long start = System.currentTimeMillis();
        final int[] time = new int[1];
        JUnitConditionRunner conditionRunner1 = new JUnitConditionRunner(null, 0, 100, 5000);
        try {
            conditionRunner1.waitFor(new Condition() {
                public boolean isTrue(ConditionRunner.Context runner) {
                    return time[0]++ == 52;
                }
            });
            fail("the condition should have failed");
        } catch (AssertionFailedError expected) {
            long l = System.currentTimeMillis() - start;
            assertTrue(l >= 5000); // timed out after 5000 milliseconds
        }

    }

    /**
     * Why?  Well because for some technologies/setups, any Selenium operation
     * may result in a 'body not loaded' for the first few loops
     * See http://jira.openqa.org/browse/SRC-302
     * @throws Exception
     */
    public void testCanLateNotifyOfSeleniumExceptionAfterTimeout() throws Exception {
        long start = System.currentTimeMillis();
        final int[] time = new int[1];
        JUnitConditionRunner conditionRunner1 = new JUnitConditionRunner(null, 0, 100, 5000);
        try {
            conditionRunner1.waitFor(new Condition() {
                public boolean isTrue(ConditionRunner.Context runner) {
                    throw new SeleniumException("Yeehaa!");
                }
            });
            fail("the condition should have failed");
        } catch (AssertionFailedError expected) {
            assertEquals("SeleniumException while waiting for 'Condition \"null\"' (otherwise timed out); cause: Yeehaa!", expected.getMessage());
            long l = System.currentTimeMillis() - start;
            assertTrue(l >= 5000); // timed out after 5000 milliseconds
        }

    }


    public void testRuntimeExceptionInsideConditionIsWrapped() {
        final RuntimeException thrownException = new RuntimeException("ooops");
        Condition condition = new Condition("foo") {
            public boolean isTrue(ConditionRunner.Context runner) {
                throw thrownException;
            }
        };
        try {
            conditionRunner.waitFor(condition);
            fail("should have thrown a exception");
        } catch (AssertionFailedError expected) {
            assertEquals("Exception while waiting for 'Condition \"foo\"'; cause: ooops", expected.getMessage());
        }
    }

    public void testAssertionFailureInsideConditionIsNotWrapped() {
        Condition condition = new Condition() {
            public boolean isTrue(ConditionRunner.Context runner) {
                assertTrue("OMG", false);
                return false;
            }
        };
        try {
            conditionRunner.waitFor(condition);
            fail("should have thrown an assertion failed error");
        } catch (AssertionFailedError expected) {
            assertEquals("OMG", expected.getMessage());
            assertEquals(AssertionFailedError.class, expected.getClass());
        }
    }

    public void testMessageWithArgs() {
        final RuntimeException thrownException = new RuntimeException();
        Condition condition = new Condition("foo %s baz", "bar") {
            public boolean isTrue(ConditionRunner.Context runner) {
                throw thrownException;
            }
        };
        try {
            conditionRunner.waitFor(condition);
            fail("should have thrown a runtime exception");
        } catch (AssertionFailedError expected) {
            assertEquals("Exception while waiting for 'Condition \"foo bar baz\"'",
                    expected.getMessage());
        }
    }

    private static class AlwaysFalseCondition extends Condition {
        public AlwaysFalseCondition() {
            super("Sky should be blue");
        }

        public boolean isTrue(ConditionRunner.Context context) {
            context.info("sky is in fact pink");
            return false;
        }
    }

    private static class AlwaysTrueCondition extends Condition {
        public AlwaysTrueCondition() {
            super("Sky should be blue");
        }

        public boolean isTrue(ConditionRunner.Context context) {
            context.info("yes it is really is blue");
            return true;
        }
    }
}
