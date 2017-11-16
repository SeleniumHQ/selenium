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

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ByIdOrName;
import org.openqa.selenium.support.How;

public class HowTest {

  private static final String VALUE = "value";

  @Test
  public void testBuildByClassName(){
    assertEquals(By.className(VALUE).toString(), How.CLASS_NAME.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByCss(){
    assertEquals(By.cssSelector(VALUE).toString(), How.CSS.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildById(){
    assertEquals(By.id(VALUE).toString(), How.ID.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByIdOrName(){
    assertEquals(new ByIdOrName(VALUE).toString(), How.ID_OR_NAME.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByLinkText(){
    assertEquals(By.linkText(VALUE).toString(), How.LINK_TEXT.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByName(){
    assertEquals(By.name(VALUE).toString(), How.NAME.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByPartialLinkText(){
    assertEquals(By.partialLinkText(VALUE).toString(),
                 How.PARTIAL_LINK_TEXT.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByTagName(){
    assertEquals(By.tagName(VALUE).toString(), How.TAG_NAME.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildByXpath(){
    assertEquals(By.xpath(VALUE).toString(), How.XPATH.buildBy(VALUE).toString());
  }

  @Test
  public void testBuildUnset(){
    assertEquals(By.id(VALUE).toString(), How.UNSET.buildBy(VALUE).toString());
  }
}
