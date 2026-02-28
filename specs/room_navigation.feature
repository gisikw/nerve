Feature: Room Navigation
  Selecting rooms, displaying the room list, and sidebar behavior.

  Scenario: Room list displays after login
    Given the user is logged in
    And the backend returns a list of rooms
    Then each room appears in the sidebar

  Scenario: Rooms with mentions show number badge
    Given a room has highlight_count greater than 0
    Then the room shows an unread badge with the mention count

  Scenario: Rooms with unreads but no mentions show bold text only
    Given a room has notification_count greater than 0
    And the room has highlight_count equal to 0
    Then the room name is displayed in bold
    And no number badge is shown

  Scenario: Mention badge caps at 99+
    Given a room has highlight_count greater than 99
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

  Scenario: Archiving a room removes it from active channels
    Given a room is visible in the Channels section
    When the user clicks the archive button for that room
    Then the backend sets the Matrix m.lowpriority tag on the room
    And the room disappears from the Channels section
    And the room appears in the Archived section
    And the Archived section header shows the count of archived rooms

  Scenario: Archived section is collapsible
    Given there are archived rooms
    When the Archived section is collapsed
    Then the archived rooms are hidden
    And the Archived section header still shows the count

  Scenario: Archived section is initially collapsed
    Given the Archived section header is visible
    And the user has not previously expanded it
    Then the archived rooms list is not visible
    And the twirldown shows "▶"

  Scenario: Expanding archived section shows archived rooms
    Given the Archived section is collapsed
    When the user clicks the Archived section header
    Then the archived rooms list becomes visible
    And the twirldown shows "▼"

  Scenario: Unarchiving a room restores it to active channels
    Given a room is in the Archived section
    When the user clicks the unarchive button for that room
    Then the room disappears from the Archived section
    And the room appears in the Channels section
    And if no archived rooms remain, the Archived section header is hidden

  Scenario: Archived rooms persist across sessions
    Given a room has been archived via Matrix's m.lowpriority tag
    When the user refreshes the page
    Then the room still appears in the Archived section
    And the room does not appear in the Channels section
    And the archive state persists on the server

  Scenario: Archived rooms can be selected
    Given a room is in the Archived section
    When the user clicks that archived room
    Then the room becomes selected
    And messages load for that room
    And the room remains in the Archived section

  Scenario: Archived rooms show mention badges
    Given an archived room has highlight_count greater than 0
    Then the room shows an unread badge in the Archived section
    And the badge follows the same display rules as active rooms

  Scenario: Archive state is server-managed
    Given the user has archived a room with id "!test:matrix.org"
    Then the backend sets the Matrix m.lowpriority tag on the room
    And the archived state is reflected in the room list from the server

  Scenario: Archive toggle is idempotent
    Given a room is archived via Matrix's m.lowpriority tag
    When the user clicks the unarchive button
    And then clicks the archive button again
    Then the room ends up archived
    And the archive state is correctly persisted on the server
