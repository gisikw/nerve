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

  Scenario: Activity indicator appears rightmost in channel row
    Given a channel entry in the sidebar
    And the channel has typing activity
    Then the typing indicator appears as the rightmost element
    And the archive button appears before the typing indicator

  Scenario: Channels section is collapsible
    Given the channels section is expanded
    When the user clicks the channels section header
    Then the channels section collapses
    And only channels with activity remain visible

  Scenario: Channels with unreads shown when collapsed
    Given the channels section is collapsed
    And a channel has notification_count greater than 0
    Then that channel is visible in the sidebar

  Scenario: Channels without activity hidden when collapsed
    Given the channels section is collapsed
    And a channel has notification_count equal to 0
    Then that channel is not visible in the sidebar

  Scenario: All channels shown when expanded
    Given the channels section is expanded
    Then all active channels are visible regardless of activity

  Scenario: Twirldown indicates collapse state
    Given the channels section header
    When the section is expanded
    Then the twirldown shows "▼"
    And when the section is collapsed
    Then the twirldown shows "▶"

  Scenario: Archive icons are monochrome SVGs
    Given a channel entry in the sidebar
    Then the archive button contains a monochrome SVG icon
    And the icon uses currentColor for stroke
    And the icon does not use colored emoji characters
