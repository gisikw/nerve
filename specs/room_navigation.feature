Feature: Room Navigation
  Selecting rooms, displaying the room list, and sidebar behavior.

  Scenario: Room list displays after login
    Given the user is logged in
    And the backend returns a list of rooms
    Then each room appears in the sidebar

  Scenario: Rooms with notifications show badge
    Given a room has notification_count greater than 0
    Then the room shows an unread badge with the count

  Scenario: Notification badge caps at 99+
    Given a room has notification_count greater than 99
    Then the badge displays "99+"

  Scenario: Selecting a room loads messages
    Given the user clicks a room in the sidebar
    Then that room is visually selected
    And message loading begins for that room
    And existing messages are cleared

  Scenario: No room selected shows placeholder
    Given no room is selected
    Then the chat area shows "Select a room"

  Scenario: Room list polls periodically
    Given the user is on the main page
    Then the room list refreshes every 5 seconds
