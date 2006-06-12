/*
 * Created on Jun 12, 2006
 *
 */
package org.openqa.selenium;

import java.io.*;

import junit.framework.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.types.*;

public class XlatorTaskTest extends TestCase {

    private File inputDir;
    private File outputDir;
    
    protected void setUp() throws Exception {
        File globalTempDir = new File(System.getProperty("java.io.tmpdir"));
        inputDir = File.createTempFile("XlatorTaskTestInput", "", globalTempDir);
        inputDir.delete();
        inputDir.mkdir();
        outputDir = File.createTempFile("XlatorTaskTestOutput", "", globalTempDir);
        outputDir.delete();
        outputDir.mkdir();
    }

    protected void tearDown() throws Exception {
        inputDir.delete();
        outputDir.delete();
    }
    
    public void testNoFiles() throws Exception {
        executeTask("java-rc");
    }

    private void executeTask(String formatter) {
        XlatorTask task = new XlatorTask();
        task.setProject(new Project());
        FileSet fs = new FileSet();
        fs.setDir(inputDir);
        task.addFileSet(fs);
        task.setDestDir(outputDir);
        XlatorTask.FormatterType f = new XlatorTask.FormatterType();
        f.setValue(formatter);
        task.setFormatter(f);
        task.execute();
    }
    
    public void testOneFile() throws Exception {
        File click = new File(inputDir, "TestClick.html");
        String clickSrc = Xlator.loadResource("/tests/TestClick.html");
        XlatorTask.writeFile(click, clickSrc);
        executeTask("java-rc");
        File output = new File(outputDir, "TestClick.java");
        assertTrue("Output is missing", output.exists());
    }
    
    public void testNotEnoughInfo() {
        XlatorTask task = new XlatorTask();
        task.setProject(new Project());
        try {
            task.execute();
            fail("Didn't catch expected exception");
        } catch (BuildException e) {}
        FileSet fs = new FileSet();
        fs.setDir(inputDir);
        task.addFileSet(fs);
        try {
            task.execute();
            fail("Didn't catch expected exception");
        } catch (BuildException e) {}
        XlatorTask.FormatterType f = new XlatorTask.FormatterType();
        f.setValue("java-rc");
        task.setFormatter(f);
        try {
            task.execute();
            fail("Didn't catch expected exception");
        } catch (BuildException e) {}
    }
}
