/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;
import static org.hamcrest.core.IsEqual.equalTo;
import org.jmock.integration.junit3.MockObjectTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.support.pagefactory.ByChained;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.How;

public class AnnotationsTest extends MockObjectTestCase {
  public WebElement default_field;

  @FindBy(how = How.NAME, using="cheese")
  public WebElement longFindBy_field;

  @FindBy(name = "cheese")
  public WebElement shortFindBy_field;

  @FindBys({@FindBy(how = How.NAME, using = "cheese"),
            @FindBy(id = "fruit")})
  public WebElement findBys_field;

  @FindBy(how = How.NAME, using="cheese")
  @FindBys({@FindBy(how = How.NAME, using = "cheese"),
            @FindBy(id = "fruit")})
  public WebElement findByAndFindBys_field;

  @FindBy(id = "cheese", name = "fruit")
  public WebElement findByMultipleHows_field;

  @FindBys({@FindBy(id = "cheese", name = "fruit"),
            @FindBy(id = "crackers")})
  public WebElement findBysMultipleHows_field;

  public void testDefault() throws Exception {
    assertThat(new Annotations(getClass().getField("default_field")).buildBy(),
               equalTo((By) new ByIdOrName("default_field")));
  }

  public void testLongFindBy() throws Exception {
    assertThat(new Annotations(getClass().getField("longFindBy_field")).buildBy(),
               equalTo(By.name("cheese")));
  }

  public void testShortFindBy() throws Exception {
    assertThat(new Annotations(getClass().getField("shortFindBy_field")).buildBy(),
               equalTo(By.name("cheese")));
  }

  public void testFindBys() throws Exception {
    assertThat(new Annotations(getClass().getField("findBys_field")).buildBy(),
               is(equalTo((By) new ByChained(By.name("cheese"), By.id("fruit")))));
  }

  public void testFindByAndFindBys() throws Exception {
    try {
      new Annotations(getClass().getField("findByAndFindBys_field")).buildBy();
      fail("Expected field annotated with both @FindBy and @FindBys "
           + "to throw exception");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

  public void testFindByMultipleHows() throws Exception {
    try {
      new Annotations(getClass().getField("findByMultipleHows_field")).buildBy();
      fail("Expected field annotated with invalid @FindBy to throw error");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

  public void testFindBysMultipleHows() throws Exception {
    try {
      new Annotations(getClass().getField("findBysMultipleHows_field")).buildBy();
      fail("Expected field annotated with @FindBys containing bad @FindBy to throw error");
    } catch (IllegalArgumentException e) {
      // Expected exception
    }
  }

}
