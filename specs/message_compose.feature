Feature: Message Compose
  Sending messages from the compose bar.

  Scenario: Sending a message clears the input
    Given the user types a message and submits
    Then the compose input is cleared

  Scenario: Enter key submits the message
    Given the user is focused on the compose input
    When the user presses Enter without Shift
    Then the message is submitted
    And the default newline is prevented

  Scenario: Shift+Enter inserts a newline
    Given the user is focused on the compose input
    When the user presses Shift+Enter
    Then a newline is inserted
    And the message is not submitted

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

  Scenario: Textarea height resets after sending
    Given the user has typed a multi-line message
    When the user submits the message
    Then the compose textarea collapses to single-line height
