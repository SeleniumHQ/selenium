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
package com.thoughtworks.selenium.results.servlet;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author Darren Cotterill
 * @author Ajit George
 */
public class SeleniumResultsServlet extends HttpServlet {
    
    private static TestResults results;

    public static TestResults getResults() {
        return results;
    }
    
    public static void setResults(TestResults testResults) {
        results = testResults;
    }

    protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		if (request.getParameter("clear") != null) {
			results = null;
			ServletOutputStream out = response.getOutputStream();
            out.println("selenium results cleared!");
		} else {
			forwardToResultsPage(request, response);
		}
	}

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
                                                throws ServletException, IOException {
        String result = request.getParameter("result");
        String totalTime = request.getParameter("totalTime");
        String numTestPasses = request.getParameter("numTestPasses");
        String numTestFailures = request.getParameter("numTestFailures");
        String numCommandPasses = request.getParameter("numCommandPasses");
        String numCommandFailures = request.getParameter("numCommandFailures");
        String numCommandErrors = request.getParameter("numCommandErrors");
        String suite = request.getParameter("suite");
		
		int numTotalTests = Integer.parseInt(numTestPasses) + Integer.parseInt(numTestFailures);
		
		List testTables = createTestTables(request, numTotalTests);

        
		results = new TestResults(result, totalTime,
				numTestPasses, numTestFailures, numCommandPasses,
				numCommandFailures, numCommandErrors, suite, testTables);
		
        forwardToResultsPage(request, response);
    }


    private List createTestTables(HttpServletRequest request, int numTotalTests) {
		List testTables = new LinkedList();
		for (int i = 1; i <= numTotalTests; i++) {
            String testTable = request.getParameter("testTable." + i);
            System.out.println("table " + i);
            System.out.println(testTable);
            testTables.add(testTable);
        }
		return testTables;
	}


    private void forwardToResultsPage(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setAttribute("results", results);
        request.getRequestDispatcher("/WEB-INF/jsp/viewResults.jsp").forward(request, response);
    }
}
