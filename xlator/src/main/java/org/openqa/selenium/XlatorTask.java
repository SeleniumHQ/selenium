/*
 * Created on Jun 12, 2006
 *
 */
package org.openqa.selenium;

import java.io.*;
import java.util.*;

import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.types.*;
import org.apache.tools.ant.util.*;

/**
 * Provides an Ant task to run the Selenium Translator, which translates HTML Selenese into
 * other programming languages.
 *  
 * <h3>Parameters</h3>
 * <table border="1" cellpadding="2" cellspacing="0">
 * 
 *  <tr> <td> <B>Attribute</B> </td> <td> <B>Description</B> </td> <td> <B>Required</B> </td> </tr>
 *  <tr> <td>destDir</td> <td>Location to write the translated files</td> <td>Yes</td> </tr>
 *  <tr> <td>formatter</td> <td>Formatter to use; currently supported formatters are "java-rc", "cs-rc", "perl-rc", "python-rc", and "ruby-rc".</td> <td>Yes</td> </tr>
 *  </table>
 *  <h3>Parameters as Nested Elements</h3>
 *  <h4>fileset</h4>
 *  
 *  <p>A <a href="http://ant.apache.org/manual/CoreTypes/fileset.html">fileset</a> of HTML Selenese files to translate</p>
 *  
 *  <h4>mapper</h4>
 *  
 *  <p>A <a href="http://ant.apache.org/manual/CoreTypes/mapper.html">mapper</a> of files to output files.  The default mapper is a glob mapper from *.html to the appropriate extension for the specified formatter (.java, .cs, .pl, etc.).</p>
 *  @author danielf
 *
 */
public class XlatorTask extends Task {

    private Vector<FileSet> _filesets = new Vector<FileSet>();
    private HashMap<String, String> options = new HashMap<String, String>();
    private Mapper mapperElement;
    private File destDir;
    private FormatterType formatter;
    
    public XlatorTask() {
        super();
        
    }
    
    /** Specifies a destination directory for translated output */
    public void setDestDir(File destDir) {
        this.destDir = destDir;
    }    
    
    public void setFormatter(FormatterType formatter) {
        this.formatter = formatter;
    }

    public void addFileSet(FileSet fs) {
        _filesets.addElement(fs);
    }
    
    public void addConfiguredOption(Property p) {
        options.put(p.getName(), p.getValue());
    }
    
    /**
     * Defines the mapper to map source to destination files.
     * @return a mapper to be configured
     * @exception BuildException if more than one mapper is defined
     */
    public Mapper createMapper() throws BuildException {
        if (mapperElement != null) {
            throw new BuildException("Cannot define more than one mapper",
                                     getLocation());
        }
        mapperElement = new Mapper(getProject());
        return mapperElement;
    }
    
    // The default mapper maps *.html -> *.java, or *.cs, etc.
    private void createDefaultMapper() {
        if (mapperElement != null) return;
        assert formatter != null;
        String extension = formatter.getExtension();
        createMapper();
        assert mapperElement != null;
        Mapper.MapperType t = new Mapper.MapperType();
        t.setValue("glob");
        mapperElement.setType(t);
        mapperElement.setFrom("*.html");
        mapperElement.setTo("*." + extension);
    }
    
    public void execute() throws BuildException {
        checkPreconditions();
        FileNameMapper mapper = mapperElement.getImplementation();
        
        // Loop through all nested filesets, looking for files to translate
        for (int i = 0; i < _filesets.size(); i++) {
            FileSet fs = (FileSet) _filesets.elementAt(i);
            DirectoryScanner ds = fs.getDirectoryScanner(getProject());
            String[] files = ds.getIncludedFiles();
            File d = fs.getDir(getProject());
            if (files.length > 0) {
                log("Handling " + files.length + " files from "
                    + d.getAbsolutePath());
                for (int j = 0; j < files.length; j++) {
                    String fileName = files[j];
                    translateFile(mapper, d, fileName);
                }
            }
        }
    }
    
    private void checkPreconditions() throws BuildException {
        if (_filesets.size() == 0) {
            throw new BuildException("You must specify at least one fileset!");
        }
        if (formatter == null) {
            throw new BuildException("You must specify a formatter!");
        }
        if (destDir == null) {
            throw new BuildException("You must specify a destDir!");
        }
        if (!destDir.exists()) {
            throw new BuildException("destDir doesn't exist: " + destDir.getAbsolutePath());
        }
        createDefaultMapper();
    }

    private void translateFile(FileNameMapper mapper, File srcDir, String fileName) {
        File input = new File(srcDir, fileName);
        String htmlSource;
        String output;
        try {
            log("Reading " + input.getAbsolutePath(), Project.MSG_DEBUG);
            htmlSource = Xlator.loadFile(input);
            log("Translating", Project.MSG_DEBUG);
            output = Xlator.xlateTestCase(formatter.getValue(), htmlSource, options);
        } catch (Exception e) {
            throw new BuildException(e);
        }
        String[] outputFileNames = mapper.mapFileName(fileName);
        for (int i = 0; i < outputFileNames.length; i++) {
            File outputFile = new File(destDir, outputFileNames[i]);
            try {
                log("Writing " + outputFile.getAbsolutePath(), Project.MSG_DEBUG);
                writeFile(outputFile, output);
            } catch (IOException e) {
                throw new BuildException(e);
            }
        }
    }
    
    static void writeFile(File outputFile, String text) throws IOException {
        FileWriter out = new FileWriter(outputFile);
        out.write(text);
        out.close();
    }
    
    /*
     * By creating this enumerated attribute, Ant will make sure the user defines
     * a valid formatter name.  Plus, we get to specify a default extension for
     * the output files.
     */
    public static class FormatterType extends EnumeratedAttribute {
        private static Properties formatters;
        private static String[] values;

        static {
            formatters = new Properties();
            formatters.put("java-rc",
                                "java");
            formatters.put("cs-rc",
                                "cs");
            formatters.put("perl-rc",
                                "pl");
            formatters.put("python-rc",
                                "py");
            formatters.put("ruby-rc",
                                "rb");
            Vector<String> keys = new Vector<String>();
            for (Iterator i = formatters.keySet().iterator(); i.hasNext();) {
                keys.add((String) i.next());
            }
            values = keys.toArray(new String[0]);
        }
        
        public FormatterType() {}

        public String[] getValues() {
            return values;
        }

        public String getExtension() {
            return formatters.getProperty(getValue());
        }
    }
}
