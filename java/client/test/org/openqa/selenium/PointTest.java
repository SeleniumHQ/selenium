// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium;

import junit.framework.TestCase;

/**
 * Tests WebDriver's Point class.
 */
public class PointTest extends TestCase {

  public void testSimpleAssignment() {
    Point p1 = new Point(30, 50);
    assertEquals(30, p1.getX());
    assertEquals(50, p1.getY());
  }

  public void testEquality() {
    Point p1 = new Point(30, 60);
    Point p2 = new Point(40, 60);

    assertNotSame(p1, p2);
    // Doesn't have to be different, but known to be different for this case.
    assertNotSame(p1.hashCode(), p2.hashCode());

    Point p1copy = new Point(30, 60);

    assertEquals(p1, p1copy);
    assertEquals(p1.hashCode(), p1copy.hashCode());
  }

  public void testMoveBy() {
    Point p1 = new Point(31, 42);

    assertEquals(new Point(35, 47), p1.moveBy(4, 5));
  }
}
