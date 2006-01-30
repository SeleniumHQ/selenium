package com.thoughtworks.selenium.runner;

import java.io.File;
import java.io.IOException;
import org.apache.commons.io.FileUtils;

/**
 * @author Darren Cotterill
 * @author Ajit George
 * @version $Revision: $
 */
public class ResultWriter {
    private final File resultFile;
    
    public ResultWriter(File resultFile) {
        this.resultFile = resultFile;
    }
    
    public void write(String results) {
        if (results == null) {
            results = "results never provided by postServlet";
        }
        
        try {
            FileUtils.writeStringToFile(resultFile, results, System.getProperty("file.encoding"));
        } catch (IOException e) {
            throw new RuntimeException("could not write results to " + resultFile);
        }
    }
}