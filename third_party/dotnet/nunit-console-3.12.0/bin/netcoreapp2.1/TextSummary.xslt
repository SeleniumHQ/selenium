<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method='text'/>

  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="test-run">
    <xsl:text>NUnit Version </xsl:text>
    <xsl:value-of select="environment/@nunit-version"/>
    <xsl:text>  </xsl:text>
    <xsl:value-of select="@start-time"/>
    <xsl:text>  </xsl:text>
    <xsl:value-of select="@end-time"/>
    <xsl:text>&#xD;&#xA;&#xD;&#xA;</xsl:text>

    <xsl:text>Runtime Environment -&#xD;&#xA;</xsl:text>
    <xsl:text>   OS Version: </xsl:text>
    <xsl:value-of select="environment/@os-version"/>
    <xsl:text>&#xD;&#xA;</xsl:text>
    <xsl:text>  CLR Version: </xsl:text>
    <xsl:value-of select="environment/@clr-version"/>
    <xsl:text>&#xD;&#xA;&#xD;&#xA;</xsl:text>

    <xsl:text>Tests Run: </xsl:text>
    <xsl:value-of select="@total"/>

    <xsl:text>, Passed: </xsl:text>
    <xsl:value-of select="@passed"/>
    <xsl:text>, Failed: </xsl:text>
    <xsl:value-of select="@failed"/>
    <xsl:text>, Inconclusive: </xsl:text>
    <xsl:value-of select="@inconclusive"/>
    <xsl:text>, Skipped: </xsl:text>
    <xsl:value-of select="@skipped"/>
    
    <xsl:text>, Elapsed Time: </xsl:text>
    <xsl:value-of select="@duration"/>
  </xsl:template>

</xsl:stylesheet>
