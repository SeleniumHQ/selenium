// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.pagefactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.AbstractFindByBuilder;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.FindAll;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.FindBys;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactoryFinder;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.util.List;

public class AnnotationsTest {

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

  @FindAll({@FindBy(how = How.TAG_NAME, using = "div"),
            @FindBy(id = "fruit")})
  public WebElement findAll_field;

  @FindBy(how = How.NAME, using = "cheese")
  @FindBys({@FindBy(how = How.NAME, using = "cheese"),
      @FindBy(id = "fruit")})
  public WebElement findByAndFindBys_field;

  @FindBy(how = How.NAME, using = "cheese")
  @FindAll({@FindBy(how = How.NAME, using = "cheese"),
            @FindBy(id = "fruit")})
  public WebElement findAllAndFindBy_field;

  @FindAll({@FindBy(how = How.NAME, using = "cheese"),
            @FindBy(id = "fruit")})
  @FindBys({@FindBy(how = How.NAME, using = "cheese"),
            @FindBy(id = "fruit")})
  public WebElement findAllAndFindBys_field;

  @FindBy(id = "cheese", name = "fruit")
  public WebElement findByMultipleHows_field;

  @FindBy(id = "cheese", name = "fruit")
  public List<WebElement> findAllByMultipleHows_field;

  @FindBys({@FindBy(id = "cheese", name = "fruit"),
      @FindBy(id = "crackers")})
  public WebElement findBysMultipleHows_field;

  @FindAll({@FindBy(id = "cheese", name = "fruit"),
            @FindBy(id = "crackers")})
  public WebElement findAllMultipleHows_field;

  @FindBy(using = "cheese")
  public WebElement findByUnsetHow_field;

  @Retention(RetentionPolicy.RUNTIME)
  @Target({ElementType.FIELD, ElementType.TYPE})
  @PageFactoryFinder(FindByXXXX.FindByXXXXBuilder.class)
  public @interface FindByXXXX {

    class FindByXXXXBuilder extends AbstractFindByBuilder {

      @Override
      public By buildIt(Object annotation, Field field) {
        return new By() {
          @Override
          public List<WebElement> findElements(SearchContext context) {
            return null;
          }

          @Override
          public String toString() {
            return "FindByXXXX's By";
          }
        };
      }
    }

  }

  @FindByXXXX()
  public WebElement findBy_xxx;

  @Test
  public void testDefault() throws Exception {
    assertThat(new Annotations(getClass().getField("default_field")).buildBy())
        .isEqualTo(new ByIdOrName("default_field"));
  }

  @Test
  public void testDefaultList() throws Exception {
    assertThat(new Annotations(getClass().getField("defaultList_field")).buildBy())
        .isEqualTo(new ByIdOrName("defaultList_field"));
  }

  @Test
  public void longFindBy() throws Exception {
    assertThat(new Annotations(getClass().getField("longFindBy_field")).buildBy())
        .isEqualTo(By.name("cheese"));
  }

  @Test
  public void longFindAllBy() throws Exception {
    assertThat(new Annotations(getClass().getField("longFindAllBy_field")).buildBy())
        .isEqualTo(By.name("cheese"));
  }

  @Test
  public void shortFindBy() throws Exception {
    assertThat(new Annotations(getClass().getField("shortFindBy_field")).buildBy())
        .isEqualTo(By.name("cheese"));
  }

  @Test
  public void shortFindAllBy() throws Exception {
    assertThat(new Annotations(getClass().getField("shortFindAllBy_field")).buildBy())
        .isEqualTo(By.name("cheese"));
  }

  @Test
  public void findBys() throws Exception {
    assertThat(new Annotations(getClass().getField("findBys_field")).buildBy())
        .isEqualTo(new ByChained(By.name("cheese"), By.id("fruit")));
  }

  @Test
  public void findAll() throws Exception {
    assertThat(new Annotations(getClass().getField("findAll_field")).buildBy())
        .isEqualTo(new ByAll(By.tagName("div"), By.id("fruit")));
  }

  @Test
  public void findByAndFindBys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with both @FindBy and @FindBys to throw exception")
        .isThrownBy(() -> new Annotations(getClass().getField("findByAndFindBys_field")).buildBy());
  }

  @Test
  public void findAllAndFindBy() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with both @FindAll and @FindBy to throw exception")
        .isThrownBy(() -> new Annotations(getClass().getField("findByAndFindBys_field")).buildBy());
  }

  @Test
  public void findAllAndFindBys() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with both @FindAll and @FindBys to throw exception")
        .isThrownBy(() -> new Annotations(getClass().getField("findByAndFindBys_field")).buildBy());
  }

  @Test
  public void findByMultipleHows() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with invalid @FindBy to throw error")
        .isThrownBy(() -> new Annotations(getClass().getField("findByMultipleHows_field")).buildBy());
  }

  @Test
  public void findAllByMultipleHows() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with @FindAllBy containing bad @FindAllBy to throw error")
        .isThrownBy(() -> new Annotations(getClass().getField("findAllByMultipleHows_field")).buildBy());
  }

  @Test
  public void findBysMultipleHows() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with @FindBys containing bad @FindBy to throw error")
        .isThrownBy(() -> new Annotations(getClass().getField("findBysMultipleHows_field")).buildBy());
  }

  @Test
  public void findAllMultipleHows() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .describedAs("Expected field annotated with @FindAll containing bad @FindBy to throw error")
        .isThrownBy(() -> new Annotations(getClass().getField("findAllMultipleHows_field")).buildBy());
  }

  @Test
  public void findByUnsetHowIsEquivalentToFindById() throws Exception {
    assertThat(new Annotations(getClass().getField("findByUnsetHow_field")).buildBy())
        .isEqualTo(By.id("cheese"));
  }

  /*
   * Example of how teams making their own @FinyBy alikes would experience a general purpose
   * capability.
   *
   * @See @FindByXXXX (above)
   */
  @Test
  public void findBySomethingElse() throws Exception {
    assertThat(new Annotations(getClass().getField("findBy_xxx")).buildBy().toString())
        .isEqualTo("FindByXXXX's By");
  }

}
