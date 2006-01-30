<%--
  - Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
  - Mike Cannon-Brookes,Patrick A Lightbody
  - All rights reserved.
  -
  - Redistribution and use in source and binary forms, with or without
  - modification, are permitted provided that the following conditions are met:
  -
  -     * Redistributions of source code must retain the above copyright
  - notice, this list of conditions and the following disclaimer.
  -     * Redistributions in binary form must reproduce the above copyright
  - notice, this list of conditions and the following disclaimer
  - in the documentation and/or other materials provided with the distribution.
  -     * Neither the name of the 'Wiley & Sons', 'Java Open Source
  - Programming' nor the names of the authors may be used to endorse or
  - promote products derived from this software without specific prior
  - written permission.
  -
  - THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  - "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  - LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  - A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  - OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  - SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  - LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  - DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  - THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  - (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  - OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  --%>

<html>
  <head>
    <title>Welcome to PetSoar!</title>
  </head>
  <body>
    <p>
        Welcome to the PetSoar application. This application does not support all the features of Sun's original PetStore
        application, but rather just a few features that allowed the authors demonstrate the topics covered in the book,
        <u>Java OpenSource Programming: with XDoclet, JUnit, WebWork, Hibernate</u>.
    </p>
    
    <h2>Getting Started</h2>
    <p>
        Since you're here, that means that you've already launched the application. If you imported the sample data, 
        you can <a href="<%= request.getContextPath() %>/login.jsp">log in</a> with the username <i>duke</i> and
        password <i>duke</i>. If you didn't import the sample data, you are free to create a new user by following
        the <a href="<%= request.getContextPath() %>/signup.jsp">Signup</a> page.
    </p>

    <h2>Tips</h2>
    <p>
        Some of the pages in this application contain information and pointers regarding the techniques and technologies
        used for the particular page or feature. For example, this page (and all the pages, in fact) are decorated using
        <a href="http://www.opensymphony.com/sitemesh">SiteMesh</a>, which is discussed in <b>Chapter 7</b>. It is
        important to note that the UI in this application is built around describing the application, so you will not
        find any verbiage making the user interface more user-friendly, but rather developer-friendly.
    </p>

    <h2>What's Next</h2>
    <p>
        This application is divided in to two parts: end-user support and administrative support. End-user features
        include searching for pets, browsing pets by category, adding pets to a shopping cart, and checking out orders.
        Administrative support includes the ability to manage the store inventory. You can being either path by following
        the links below:
    </p>

    <p><a href="inventory">Manage Inventory</a></p>

    <p><a href="storefront/listpets.action">Browse Store Front</a></p>

    </p>
  </body>
</html>