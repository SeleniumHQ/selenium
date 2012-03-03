// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotSame;

/**
 * Test WebDriver's Dimensions class.
 */
public class DimensionTest {
  @Test
  public void testSimpleAssignment() {
    Dimension d1 = new Dimension(100, 200);
    assertEquals(200, d1.getHeight());
    assertEquals(100, d1.getWidth());
  }

  @Test
  public void testEquality() {
    Dimension d1 = new Dimension(100, 200);
    Dimension d2 = new Dimension(200, 200);

    assertNotSame(d1, d2);
    // Doesn't have to be different, but known to be different for this case.
    assertNotSame(d1.hashCode(), d2.hashCode());

    Dimension d1copy = new Dimension(100, 200);

    assertEquals(d1, d1copy);
    assertEquals(d1.hashCode(), d1copy.hashCode());
  }


}
