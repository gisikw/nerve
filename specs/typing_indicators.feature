Feature: Typing Indicators
  Display and sending of typing status in rooms.

  Scenario: Typing indicator shows when others are typing
    Given another user is typing in the selected room
    Then a typing indicator appears above the compose bar
    And it shows the user's name and animated dots

  Scenario: Typing indicator hides when no one is typing
    Given no users are typing in the selected room
    Then the typing indicator area is empty

  Scenario: Typing indicator excludes the current user
    Given the current user is typing
    Then the typing indicator does not show the current user's name

  Scenario: Sidebar shows typing badge for other rooms
    Given a user is typing in a non-selected room
    Then the room list shows an animated "..." badge for that room

  Scenario: Typing notice sent on keystroke
    Given the user types in the compose box
    Then a send_typing_notice command is issued with is_typing true

  Scenario: Typing status polls periodically
    Given a room is selected
    Then typing status refreshes every 3 seconds alongside messages
