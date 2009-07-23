package org.openqa.selenium.chrome;

import junit.framework.TestCase;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class BootstrapTest extends TestCase {
  /*public void testCanStartAndStop() throws Exception{
    ChromeDriver driver = new ChromeDriver();
    driver.quit();
  }
  
  public void testCanNavigateToGoogleDotCom() throws Exception{
    ChromeDriver driver = new ChromeDriver();
    driver.get("http://www.google.com");
    driver.quit();
  }*/
  
  public void testCanNavigateToGoogleDotComAndSearchForCheese() throws Exception{
    ChromeDriver driver = new ChromeDriver();
    driver.get("http://www.google.com");
    WebElement element = driver.findElement(By.name("q"));
    element.sendKeys("cheese");
    WebElement submit = driver.findElement(By.name("btnG"));
    submit.click();
    
    /*assertTrue(driver.getTitle().contains("cheese"));
    driver.quit();*/
  }
  
}