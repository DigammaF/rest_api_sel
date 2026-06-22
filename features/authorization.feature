Feature: Authorization Rules

  Scenario Outline: Access protected endpoint without authentication
    When the client sends a <method> request to "<endpoint>" without a session cookie
    Then the response status should be 401

    Examples:
      | method | endpoint          |
      | GET    | /membres          |
      | GET    | /categories       |
      | GET    | /competences      |
      | GET    | /propositions     |
      | GET    | /transactions     |

  Scenario Outline: Member attempts admin operation
    Given an authenticated member session
    When the client sends a <method> request to "<endpoint>"
    Then the response status should be 401

    Examples:
      | method | endpoint        |
      | POST   | /categories     |
      | POST   | /competences    |
      | DELETE | /membres/5      |