package org.openqa.selenium.atoms;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

/**
 * All rhino-based tests for the browser atoms.
 */
@RunWith(Suite.class)
@Suite.SuiteClasses({
    CompiledAtomsNotLeakingTest.class,
    InputAtomsTest.class
})
public class AtomsRhinoTests {
}
