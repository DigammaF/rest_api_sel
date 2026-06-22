Feature: Member Competence Management

  Scenario: List member competences
    Given member code 1 exists
    And an authenticated session
    When the client sends a GET request to "/membres/1/competences"
    Then the response status should be 200

  Scenario: Member adds competence
    Given member code 1 is authenticated
    And competence 5 exists
    When the client sends a POST request to "/membres/1/competences" with:
      | competence  | 5 |
      | description | 15 years experience |
    Then the response status should be 201

  Scenario: Member updates competence description
    Given member competence 3 exists
    And member code 1 is authenticated
    When the client sends a PATCH request to "/membres/1/competences/3"
    Then the response status should be 200

  Scenario: Member removes competence
    Given member competence 3 exists
    And member code 1 is authenticated
    When the client sends a DELETE request to "/membres/1/competences/3"
    Then the response status should be 204