Feature: Message Compose
  Sending messages from the compose bar.

  Scenario: Sending a message clears the input
    Given the user types a message and submits
    Then the compose input is cleared

  Scenario: Empty messages are not sent
    Given the compose input contains only whitespace
    When the user submits
    Then no message is sent
    And the input is not cleared

  Scenario: No room selected prevents sending
    Given no room is selected
    When the user types and submits
    Then no message is sent

  Scenario: After sending, messages refresh
    Given a message is successfully sent
    Then the message list refreshes for the current room
