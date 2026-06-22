Feature: Categories Management

  Scenario: List categories
    Given an authenticated session
    When the client sends a GET request to "/categories"
    Then the response status should be 200

  Scenario: Admin creates category
    Given an authenticated admin session
    When the client sends a POST request to "/categories" with:
      | description | Jardinage |
    Then the response status should be 201

  Scenario: Non-admin creates category
    Given an authenticated member session
    When the client sends a POST request to "/categories"
    Then the response status should be 401

  Scenario: Update category
    Given category 1 exists
    And an authenticated admin session
    When the client sends a PATCH request to "/categories/1"
    Then the response status should be 200

  Scenario: Delete category used by competences
    Given category 1 is referenced by at least one competence
    And an authenticated admin session
    When the client sends a DELETE request to "/categories/1"
    Then the response status should be 409