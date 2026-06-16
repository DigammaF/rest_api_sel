Feature: Adder
  Scenario: Adding numbers together
    Given adder is empty
    When 5 is added
    And 3 is added
    Then accumulator should be 8