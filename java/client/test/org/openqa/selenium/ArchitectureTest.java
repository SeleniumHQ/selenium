/*
Copyright 2012 Software Freedom Conservancy
Copyright 2012 Opera Software ASA

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

package org.openqa.selenium;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.instanceOf;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.matchers.JUnitMatchers.containsString;

public class ArchitectureTest {

  @Test
  public void anyMatchesX86() {
    assertTrue(Architecture.ANY.is(Architecture.X86));
  }

  @Test
  public void anyMatchesX64() {
    assertTrue(Architecture.ANY.is(Architecture.X64));
  }

  @Test
  public void anyMatchesARM() {
    assertTrue(Architecture.ANY.is(Architecture.ARM));
  }

  @Test
  public void anyMatchesANY() {
    assertTrue(Architecture.ANY.is(Architecture.ANY));
  }

  @Test
  public void currentArchitecture() {
    Architecture current = Architecture.getCurrent();
    assertNotNull(current);
    assertFalse(current.is(Architecture.ANY));
  }

  @Test
  public void determineArchI386() {
    assertTrue(Architecture.extractFromSysProperty("i386").is(Architecture.X86));
  }

  @Test
  public void determineArchIA32() {
    assertTrue(Architecture.extractFromSysProperty("ia32").is(Architecture.X86));
  }

  @Test
  public void determineArchI686() {
    assertTrue(Architecture.extractFromSysProperty("i686").is(Architecture.X86));
  }

  @Test
  public void determineArchI486() {
    assertTrue(Architecture.extractFromSysProperty("i486").is(Architecture.X86));
  }

  @Test
  public void determineArchI86() {
    assertTrue(Architecture.extractFromSysProperty("i86").is(Architecture.X86));
  }

  @Test
  public void determineArchPentium() {
    assertTrue(Architecture.extractFromSysProperty("pentium").is(Architecture.X86));
  }

  @Test
  public void determineArchPentiumPro() {
    assertTrue(Architecture.extractFromSysProperty("pentium_pro").is(Architecture.X86));
  }

  @Test
  public void determineArchPentiumProMmx() {
    assertTrue(Architecture.extractFromSysProperty("pentium_pro+mmx").is(Architecture.X86));
  }

  @Test
  public void determineArchPentiumMmx() {
    assertTrue(Architecture.extractFromSysProperty("pentium+mmx").is(Architecture.X86));
  }

  @Test
  public void determineArchAMD64() {
    assertTrue(Architecture.extractFromSysProperty("amd64").is(Architecture.X64));
  }

  @Test
  public void determineArchIA64() {
    assertTrue(Architecture.extractFromSysProperty("ia64").is(Architecture.X64));
  }

  @Test
  public void determineArchARM() {
    assertTrue(Architecture.extractFromSysProperty("arm").is(Architecture.ARM));
  }

  @Test
  public void determineArchEmpty() {
    try {
      Architecture.extractFromSysProperty("");
      fail("Expected UnsupportedOperationException");
    } catch (RuntimeException e) {
      assertThat(e, is(instanceOf(UnsupportedOperationException.class)));
      assertThat(e.getMessage(), containsString("Unknown architecture"));
    }
  }

  @Test
  public void determineArchBogus() {
    try {
      Architecture.extractFromSysProperty("hoobaflooba");
      fail("Expected UnsupportedOperationException");
    } catch (RuntimeException e) {
      assertThat(e, is(instanceOf(UnsupportedOperationException.class)));
      assertThat(e.getMessage(), containsString("Unknown architecture"));
    }
  }

  @Test
  public void determineArchMixedCasing() {
    assertTrue(Architecture.extractFromSysProperty("AmD64").is(Architecture.X64));
  }

  @Test
  public void dataModelIs32Or64BitOnCurrentArchitecture() {
    int model = Architecture.getCurrent().getDataModel();
    assertTrue(model == 32 || model == 64);
  }

  @Test
  public void x86DataModelIs32Bit() {
    assertEquals(32, Architecture.X86.getDataModel());
  }

  @Test
  public void x64DataModelIs64Bit() {
    assertEquals(64, Architecture.X64.getDataModel());
  }

  @Test
  public void armDataModelIs64Bit() {
    assertEquals(64, Architecture.ARM.getDataModel());
  }

  @Test
  public void anyDataModelIs64Bit() {
    assertEquals(64, Architecture.ANY.getDataModel());
  }

}