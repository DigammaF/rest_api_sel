Feature: Competence Management

  Scenario: List competences
    Given an authenticated session
    When the client sends a GET request to "/competences"
    Then the response status should be 200

  Scenario: Filter competences by category
    Given an authenticated session
    When the client sends a GET request to "/competences?id_categorie=1"
    Then the response status should be 200

  Scenario: Admin creates competence
    Given category 1 exists
    And an authenticated admin session
    When the client sends a POST request to "/competences" with:
      | description  | Pose de placo |
      | id_categorie | 1             |
    Then the response status should be 201

  Scenario: Update competence
    Given competence 5 exists
    And an authenticated admin session
    When the client sends a PATCH request to "/competences/5"
    Then the response status should be 200

  Scenario: Delete competence
    Given competence 5 exists
    And an authenticated admin session
    When the client sends a DELETE request to "/competences/5"
    Then the response status should be 204