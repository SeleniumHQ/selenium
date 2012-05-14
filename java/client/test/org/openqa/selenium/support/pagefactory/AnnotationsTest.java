/*
Copyright 2007-2009 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.support.pagefactory;

import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.How;
import org.openqa.selenium.testing.MockTestBase;

import java.util.List;

public class AnnotationsTest extends MockTestBase {
  public WebElement default_field;
  public List<WebElement> defaultList_field;

  @FindBy(how = How.NAME, using = "cheese")
  public WebElement longFindBy_field;

  @FindBy(how = How.NAME, using = "cheese")
  public List<WebElement> longFindAllBy_field;

  @FindBy(name = "cheese")
  public WebElement shortFindBy_field;

  @FindBy(name = "cheese")
  public List<WebElement> shortFindAllBy_field;

  @FindBys({@FindBy(how = How.NAME, using = "cheese"),
      @FindBy(id = "fruit")})
  public WebElement findBys_field;

  @FindBy(how = How.NAME, using = "cheese")
  @FindBys({@FindBy(how = How.NAME, using = "cheese"),
      @FindBy(id = "fruit")})
  public WebElement findByAndFindBys_field;

  @FindBy(id = "cheese", name = "fruit")
  public WebElement findByMultipleHows_field;

  @FindBy(id = "cheese", name = "fruit")
  public List<WebElement> findAllByMultipleHows_field;

  @FindBys({@FindBy(id = "cheese", name = "fruit"),
      @FindBy(id = "crackers")})
  public WebElement findBysMultipleHows_field;

  @Test
  public void testDefault() throws Exception {
    assertThat(new Annotations(getClass().getField("default_field")).buildBy(),
        equalTo((By) new ByIdOrName("default_field")));
  }

  @Test
  public void testDefaultList() throws Exception {
    assertThat(new Annotations(getClass().getField("defaultList_field")).buildBy(),
        equalTo((By) new ByIdOrName("defaultList_field")));
  }

  @Test
  public void longFindBy() throws Exception {
    assertThat(new Annotations(getClass().getField("longFindBy_field")).buildBy(),
        equalTo(By.name("cheese")));
  }

  @Test
  public void longFindAllBy() throws Exception {
    assertThat(new Annotations(getClass().getField("longFindAllBy_field")).buildBy(),
        equalTo(By.name("cheese")));
  }

  @Test
  public void shortFindBy() throws Exception {
    assertThat(new Annotations(getClass().getField("shortFindBy_field")).buildBy(),
        equalTo(By.name("cheese")));
  }

  @Test
  public void shortFindAllBy() throws Exception {
    assertThat(new Annotations(getClass().getField("shortFindAllBy_field")).buildBy(),
        equalTo(By.name("cheese")));
  }

  @Test
  public void findBys() throws Exception {
    assertThat(new Annotations(getClass().getField("findBys_field")).buildBy(),
        is(equalTo((By) new ByChained(By.name("cheese"), By.id("fruit")))));
  }

  @Test
  public void findByAndFindBys() throws Exception {
    try {
      new Annotations(getClass().getField("findByAndFindBys_field")).buildBy();
      fail("Expected field annotated with both @FindBy and @FindBys "
          + "to throw exception");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

  @Test
  public void findByMultipleHows() throws Exception {
    try {
      new Annotations(getClass().getField("findByMultipleHows_field")).buildBy();
      fail("Expected field annotated with invalid @FindBy to throw error");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

  @Test
  public void findAllByMultipleHows() throws Exception {
    try {
      new Annotations(getClass().getField("findAllByMultipleHows_field")).buildBy();
      fail("Expected field annotated with @FindAllBy containing bad @FindAllBy to throw error");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

  @Test
  public void findBysMultipleHows() throws Exception {
    try {
      new Annotations(getClass().getField("findBysMultipleHows_field")).buildBy();
      fail("Expected field annotated with @FindBys containing bad @FindBy to throw error");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

}
