package com.googlecode.webdriver;

import java.awt.Point;

public class DragAndDropTest extends AbstractDriverTestCase {
    
    public void testDragAndDrop() throws Exception {
        driver.get(dragAndDropPage);
        RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test1"));
        Point expectedLocation = img.getLocation();
        drag(img, expectedLocation, 500, 300);
        assertEquals(expectedLocation, img.getLocation());
        driver.manage().setMouseSpeed(Speed.SLOW);
        drag(img, expectedLocation, -100, -50);
        assertEquals(expectedLocation, img.getLocation());
        driver.manage().setMouseSpeed(Speed.MEDIUM);
        drag(img, expectedLocation, 0, 0);
        assertEquals(expectedLocation, img.getLocation());
        driver.manage().setMouseSpeed(Speed.FAST);
        drag(img, expectedLocation, 1, -1);
        assertEquals(expectedLocation, img.getLocation());
    }
    
    public void testDragAndDropToElement() {
        driver.get(dragAndDropPage);
        RenderedWebElement img1 = (RenderedWebElement) driver.findElement(By.id("test1"));
        RenderedWebElement img2 = (RenderedWebElement) driver.findElement(By.id("test2"));
        img1.dragAndDropBy(100, 100);
        img2.dragAndDropOn(img1);
        assertEquals(img1.getLocation(), img2.getLocation());
    }
    
    public void testElementInDiv() {
        driver.get(dragAndDropPage);
        RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test3"));
        Point expectedLocation = img.getLocation();
        drag(img, expectedLocation, 100, 100);
        assertEquals(expectedLocation, img.getLocation());
    }
    
    public void testDragTooFar() {
        driver.get(dragAndDropPage);
        RenderedWebElement img = (RenderedWebElement) driver.findElement(By.id("test1"));
        Point expectedLocation = img.getLocation();
        
        img.dragAndDropBy(Integer.MIN_VALUE, Integer.MIN_VALUE);
        assertEquals (new Point(0, 0), img.getLocation());
        
        img.dragAndDropBy(Integer.MAX_VALUE, Integer.MAX_VALUE);
        //We don't know where the img is dragged to , but we know it's not too
        //far, otherwise this function will not return for a long long time
    }
    
    public void testMouseSpeed() throws Exception {
        driver.get(dragAndDropPage);
        driver.manage().setMouseSpeed(Speed.SLOW);
        assertEquals(Speed.SLOW, driver.manage().getMouseSpeed());
        driver.manage().setMouseSpeed(Speed.MEDIUM);
        assertEquals(Speed.MEDIUM, driver.manage().getMouseSpeed());
        driver.manage().setMouseSpeed(Speed.FAST);
        assertEquals(Speed.FAST, driver.manage().getMouseSpeed());
    }
    
    private void drag(RenderedWebElement elem, Point expectedLocation, 
            int moveRightBy, int moveDownBy) {
        elem.dragAndDropBy(moveRightBy, moveDownBy);
        expectedLocation.move(expectedLocation.x + moveRightBy, expectedLocation.y + moveDownBy);
    }
}
