Feature: Authentication

  Scenario: Successful member login
    Given a member exists with code "422324" and password "monMotDePasse!"
    When the client sends a POST request to "/auth/login" with:
      | codeMembre | 422324           |
      | password   | monMotDePasse!   |
      | isAdmin    | false            |
    Then the response status should be 200
    And the response should contain:
      | profil       |
      | code_membre  |
    And a session cookie should be returned

  Scenario: Login with invalid credentials
    When the client sends a POST request to "/auth/login" with invalid credentials
    Then the response status should be 401

  Scenario: Logout authenticated member
    Given an authenticated member session
    When the client sends a POST request to "/auth/logout"
    Then the response status should be 204

  Scenario: Logout without authentication
    When the client sends a POST request to "/auth/logout" without a session cookie
    Then the response status should be 401