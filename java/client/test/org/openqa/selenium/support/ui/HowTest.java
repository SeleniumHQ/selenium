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

package org.openqa.selenium.support.ui;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.How;

public class HowTest {

  private static final String VALUE = "value";

  @Test
  public void testBuildByClassName(){
    assertThat(How.CLASS_NAME.buildBy(VALUE).toString()).isEqualTo(By.className(VALUE).toString());
  }

  @Test
  public void testBuildByCss(){
    assertThat(How.CSS.buildBy(VALUE).toString()).isEqualTo(By.cssSelector(VALUE).toString());
  }

  @Test
  public void testBuildById(){
    assertThat(How.ID.buildBy(VALUE).toString()).isEqualTo(By.id(VALUE).toString());
  }

  @Test
  public void testBuildByIdOrName(){
    assertThat(How.ID_OR_NAME.buildBy(VALUE).toString())
        .isEqualTo(new ByIdOrName(VALUE).toString());
  }

  @Test
  public void testBuildByLinkText(){
    assertThat(How.LINK_TEXT.buildBy(VALUE).toString()).isEqualTo(By.linkText(VALUE).toString());
  }

  @Test
  public void testBuildByName(){
    assertThat(How.NAME.buildBy(VALUE).toString()).isEqualTo(By.name(VALUE).toString());
  }

  @Test
  public void testBuildByPartialLinkText(){
    assertThat(How.PARTIAL_LINK_TEXT.buildBy(VALUE).toString())
        .isEqualTo(By.partialLinkText(VALUE).toString());
  }

  @Test
  public void testBuildByTagName(){
    assertThat(How.TAG_NAME.buildBy(VALUE).toString()).isEqualTo(By.tagName(VALUE).toString());
  }

  @Test
  public void testBuildByXpath(){
    assertThat(How.XPATH.buildBy(VALUE).toString()).isEqualTo(By.xpath(VALUE).toString());
  }

  @Test
  public void testBuildUnset(){
    assertThat(How.UNSET.buildBy(VALUE).toString()).isEqualTo(By.id(VALUE).toString());
  }
}
