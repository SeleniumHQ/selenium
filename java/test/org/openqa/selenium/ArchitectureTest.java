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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.Architecture.ANY;
import static org.openqa.selenium.Architecture.ARM;
import static org.openqa.selenium.Architecture.X64;
import static org.openqa.selenium.Architecture.X86;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class ArchitectureTest {

  @Test
  void anyMatchesX86() {
    assertThat(ANY.is(X86)).isTrue();
  }

  @Test
  void anyMatchesX64() {
    assertThat(ANY.is(X64)).isTrue();
  }

  @Test
  void anyMatchesARM() {
    assertThat(ANY.is(ARM)).isTrue();
  }

  @Test
  void anyMatchesANY() {
    assertThat(ANY.is(ANY)).isTrue();
  }

  @Test
  void currentArchitecture() {
    Architecture current = Architecture.getCurrent();
    assertThat(current).isNotNull();
    assertThat(current.is(ANY)).isFalse();
  }

  @Test
  void determineArchI386() {
    assertThat(Architecture.extractFromSysProperty("i386").is(X86)).isTrue();
  }

  @Test
  void determineArchIA32() {
    assertThat(Architecture.extractFromSysProperty("ia32").is(X86)).isTrue();
  }

  @Test
  void determineArchI686() {
    assertThat(Architecture.extractFromSysProperty("i686").is(X86)).isTrue();
  }

  @Test
  void determineArchI486() {
    assertThat(Architecture.extractFromSysProperty("i486").is(X86)).isTrue();
  }

  @Test
  void determineArchI86() {
    assertThat(Architecture.extractFromSysProperty("i86").is(X86)).isTrue();
  }

  @Test
  void determineArchPentium() {
    assertThat(Architecture.extractFromSysProperty("pentium").is(X86)).isTrue();
  }

  @Test
  void determineArchPentiumPro() {
    assertThat(Architecture.extractFromSysProperty("pentium_pro").is(X86)).isTrue();
  }

  @Test
  void determineArchPentiumProMmx() {
    assertThat(Architecture.extractFromSysProperty("pentium_pro+mmx").is(X86)).isTrue();
  }

  @Test
  void determineArchPentiumMmx() {
    assertThat(Architecture.extractFromSysProperty("pentium+mmx").is(X86)).isTrue();
  }

  @Test
  void determineArchAMD64() {
    assertThat(Architecture.extractFromSysProperty("amd64").is(X64)).isTrue();
  }

  @Test
  void determineArchIA64() {
    assertThat(Architecture.extractFromSysProperty("ia64").is(X64)).isTrue();
  }

  @Test
  void determineArchARM() {
    assertThat(Architecture.extractFromSysProperty("arm").is(ARM)).isTrue();
  }

  @Test
  void determineArchEmpty() {
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> Architecture.extractFromSysProperty(""))
        .withMessageContaining("Unknown architecture");
  }

  @Test
  void determineArchBogus() {
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> Architecture.extractFromSysProperty("hoobaflooba"))
        .withMessageContaining("Unknown architecture");
  }

  @Test
  void determineArchMixedCasing() {
    assertThat(Architecture.extractFromSysProperty("AmD64").is(X64)).isTrue();
  }

  @Test
  void dataModelIs32Or64BitOnCurrentArchitecture() {
    int model = Architecture.getCurrent().getDataModel();
    assertThat(model == 32 || model == 64).isTrue();
  }

  @Test
  void x86DataModelIs32Bit() {
    assertThat(X86.getDataModel()).isEqualTo(32);
  }

  @Test
  void x64DataModelIs64Bit() {
    assertThat(X64.getDataModel()).isEqualTo(64);
  }

  @Test
  void armDataModelIs64Bit() {
    assertThat(ARM.getDataModel()).isEqualTo(64);
  }

  @Test
  void anyDataModelIs64Bit() {
    assertThat(ANY.getDataModel()).isEqualTo(64);
  }
}
