Feature: Member Management

  Scenario: List members
    Given an authenticated member session
    When the client sends a GET request to "/membres"
    Then the response status should be 200
    And the response should contain a paginated list of members

  Scenario: Filter members by cotisation status
    Given an authenticated member session
    When the client sends a GET request to "/membres?status=cotisant"
    Then the response status should be 200
    And every returned member should have status "cotisant"

  Scenario: Create a member
    Given an authenticated admin session
    When the client sends a POST request to "/membres" with valid member data
    Then the response status should be 201
    And the created member should be returned

  Scenario: Create a member with an existing email
    Given a member already exists with email "marguerite@email.fr"
    When the client sends a POST request to "/membres" using the same email
    Then the response status should be 409

  Scenario: Get a member by code
    Given member code 1 exists
    And an authenticated session
    When the client sends a GET request to "/membres/1"
    Then the response status should be 200

  Scenario: Get unknown member
    Given an authenticated session
    When the client sends a GET request to "/membres/99999"
    Then the response status should be 404

  Scenario: Member updates own profile
    Given member code 1 is authenticated
    When the client sends a PATCH request to "/membres/1"
    Then the response status should be 200

  Scenario: Member updates another member profile
    Given member code 1 is authenticated
    When the client sends a PATCH request to "/membres/2"
    Then the response status should be 401

  Scenario: Admin deletes member
    Given an authenticated admin session
    And member code 5 exists
    When the client sends a DELETE request to "/membres/5"
    Then the response status should be 204