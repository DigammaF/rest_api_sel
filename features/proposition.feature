Feature: Propositions Management

  Scenario: List propositions
    Given an authenticated session
    When the client sends a GET request to "/propositions"
    Then the response status should be 200

  Scenario: Filter propositions by competence
    Given an authenticated session
    When the client sends a GET request to "/propositions?id_competence=5"
    Then the response status should be 200

  Scenario: Cotisant member creates proposition
    Given member code 1 is cotisant
    And member competence 3 belongs to member 1
    And member code 1 is authenticated
    When the client sends a POST request to "/propositions"
    Then the response status should be 201

  Scenario: Non-cotisant member creates proposition
    Given member code 1 is non-cotisant
    And member code 1 is authenticated
    When the client sends a POST request to "/propositions"
    Then the response status should be 401

  Scenario: Member creates proposition without declared competence
    Given member code 1 is authenticated
    And member code 1 has not declared competence 5
    When the client sends a POST request to "/propositions"
    Then the response status should be 400

  Scenario: Author updates proposition
    Given proposition 7 belongs to member 1
    And member code 1 is authenticated
    When the client sends a PATCH request to "/propositions/7"
    Then the response status should be 200

  Scenario: Other member updates proposition
    Given proposition 7 belongs to member 1
    And member code 2 is authenticated
    When the client sends a PATCH request to "/propositions/7"
    Then the response status should be 401

  Scenario: Author deletes proposition
    Given proposition 7 belongs to member 1
    And member code 1 is authenticated
    When the client sends a DELETE request to "/propositions/7"
    Then the response status should be 204