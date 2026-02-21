Feature: Viewport Behavior

  As a user of a fixed-layout chat application
  I want the main window to remain fixed without elastic scrolling
  So that the UI remains stable and doesn't exhibit bouncy/rubber-banding effects

  Background:
    The application is a fixed-layout client where all scrolling happens within
    designated scroll containers (message views, room lists, etc.), not at the
    document body level. The overall window should never scroll.

  Scenario: Document body prevents elastic overscroll
    Given the application is loaded
    Then the html element has overflow hidden
    And the html element has overscroll-behavior none
    And the body element has overflow hidden
    And the body element has overscroll-behavior none

  Scenario: App container prevents elastic overscroll
    Given the application is loaded
    Then the #app element has overflow hidden
    And the #app element has overscroll-behavior none

  @macOS
  Scenario: Elastic scrolling is prevented on macOS
    Given the application is running on macOS
    When the user attempts to scroll beyond content boundaries
    Then no rubber-banding effect occurs
    And the window remains fixed in position
