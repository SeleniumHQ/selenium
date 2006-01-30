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

<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<html>
    <head>
        <title>Pets In Stock</title>
    </head>
    <body>
    <table border="0">
    <tr>
        <td valign="top" width="300">

		<form action="search.action" method="get">
			<table class="form">
				<ui:textfield label="'Search'" name="'query'"/>
			</table>
		</form>

        <p>
            You can also just <a href="listcategories.action">list pets by category</a>.
        </p>


		<ww:if test="pets.size == 0">
			<p>Sorry, no pets found matching your search.</p>
		</ww:if>

		<ww:iterator value="pets.subList(startIndex, endIndex)">
			<table class="form" width="100%">
				<tr onmouseover="rowHover(this)" href="viewpet.action?id=<ww:property value="id"/>">
					<th>
						<a id="pet-<ww:property value="name"/>" href="viewpet.action?id=<ww:property value="id"/>">
							<ww:property value="name"/>
						</a> - <ww:property value="price"/>
					</th>
				</tr>
				<tr>
					<td>
						<b>Gender: </b><ww:property value="gender"/><br>
						<ww:property value="description"/>
					</td>
				</tr>
			</table>
			<br>
		</ww:iterator>

        <p>
            <ww:if test="startIndex > 0">
                <a href="listpets.action?startIndex=<ww:property value="prevStartIndex"/>&endIndex=<ww:property value="prevEndIndex"/>">
                    &lt;&lt;Prev
                </a>
            </ww:if>
            <ww:if test="pets.size() > endIndex">
                <a href="listpets.action?startIndex=<ww:property value="nextStartIndex"/>&endIndex=<ww:property value="nextEndIndex"/>">
                    Next&gt;&gt;
                </a>
            </ww:if>
        </p>

        </td>
        <td valign="top">
        <h2 align="right">Searching &amp; Pagination</h2>
        <p><font size="-1">
            This page demonstrates searching and pagination, implemented in <b>Chapter 18</b>. Assuming you have more
            than five Pets in the database (or search result), Pets will be displayed in groups of five. As discussed
            in this chapter, the PetStore is interesting because it uses a <i>PersistenceManager</i> (discussed in
            <b>Chapter 15</b>) that stores objects in a database using <a href="http://www.hibernate.org">Hibernate</a>
            as well as storing "documents" in a search index using <a href="http://jakarta.apache.org/lucene">Lucene</a>.
        </font></p>
        </td>
    </tr>
    </table>

    </body>
</html>