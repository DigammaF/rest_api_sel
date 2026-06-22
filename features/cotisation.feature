Feature: Cotisation Management

  Scenario: List member cotisations
    Given member code 1 exists
    And an authenticated session
    When the client sends a GET request to "/membres/1/cotisations"
    Then the response status should be 200

  Scenario: Admin registers a cotisation
    Given an authenticated admin session
    And member code 1 exists
    When the client sends a POST request to "/membres/1/cotisations" with:
      | annee | 2025       |
      | prix  | 10.00      |
      | date  | 2025-01-15 |
    Then the response status should be 201

  Scenario: Non-admin registers a cotisation
    Given an authenticated member session
    When the client sends a POST request to "/membres/1/cotisations"
    Then the response status should be 401

  Scenario: Delete a cotisation
    Given an authenticated admin session
    And cotisation 1 exists for member 1
    When the client sends a DELETE request to "/membres/1/cotisations/1"
    Then the response status should be 204