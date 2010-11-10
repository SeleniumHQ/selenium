/*
 * test array with 
 */
function assertJoinedArrayEquals(a1, a2) {
    assertNotNull(a1);
    assertNotNull(a2);
    assertEquals(a1.join(","), a2.join(","));
}
