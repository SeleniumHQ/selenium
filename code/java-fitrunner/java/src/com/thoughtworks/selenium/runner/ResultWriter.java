/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.thoughtworks.selenium.runner;

import java.io.File;
import java.io.IOException;
import org.apache.commons.io.FileUtils;


/**
 * @author Darren Cotterill
 * @author Ajit George
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