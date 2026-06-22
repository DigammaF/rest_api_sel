Feature: Transaction Management

  Scenario: Create transaction from proposition
    Given proposition 7 exists
    And actor and beneficiary are cotisant members
    And the actor is authenticated
    When the client sends a POST request to "/transactions" with proposition 7
    Then the response status should be 201

  Scenario: Create transaction between non-cotisant members
    Given one participant is non-cotisant
    And the actor is authenticated
    When the client sends a POST request to "/transactions"
    Then the response status should be 401

  Scenario: List transactions as admin
    Given an authenticated admin session
    When the client sends a GET request to "/transactions"
    Then the response status should be 200

  Scenario: Filter transactions by state
    Given an authenticated admin session
    When the client sends a GET request to "/transactions?etat=en_cours"
    Then the response status should be 200

  Scenario: Get transaction details
    Given transaction 10 exists
    And an authenticated session
    When the client sends a GET request to "/transactions/10"
    Then the response status should be 200

  Scenario: Actor starts transaction
    Given transaction 10 exists with state "prevu"
    And actor is authenticated
    When the client updates transaction 10 state to "en_cours"
    Then the response status should be 200
    And transaction state should be "en_cours"

  Scenario: Beneficiary validates completed transaction
    Given transaction 10 exists with state "en_cours"
    And beneficiary is authenticated
    When the client updates transaction 10 with:
      | etat      | terminee   |
      | nb_heures | 3          |
      | date_real | 2025-11-15 |
    Then the response status should be 200
    And hours balance should be updated

  Scenario: Actor validates completed transaction
    Given transaction 10 exists with state "en_cours"
    And actor is authenticated
    When the client updates transaction 10 state to "terminee"
    Then the response status should be 401

  Scenario: Update unknown transaction
    Given an authenticated session
    When the client sends a PATCH request to "/transactions/99999"
    Then the response status should be 404