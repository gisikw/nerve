Feature: UI Layout
  Visual appearance and alignment of UI elements.

  Scenario: Room header buttons are vertically aligned
    Given a room is selected
    When the room header is rendered
    Then the streams toggle button and logout button are vertically centered
    And the buttons have consistent height

  Scenario: Streams toggle icon is visible
    Given a room is selected
    When the room header is rendered
    Then the streams toggle button displays its icon
    And the icon inherits the button's color
    And the icon is visible against the background

  Scenario: Streams toggle shows active state
    Given a room is selected
    And the streams panel is open
    When the room header is rendered
    Then the streams toggle button has the active class
    And the active button uses accent color
    And the active button has accent-dim background

  Scenario: Logout button styling matches design tokens
    Given a room is selected
    When the room header is rendered
    Then the logout button uses border color from design tokens
    And the logout button uses text-muted color by default
    And the logout button uses accent color on hover
