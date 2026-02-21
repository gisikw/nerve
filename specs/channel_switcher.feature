Feature: Channel Switcher
  Cmd+K fuzzy room switcher for quick navigation.

  Scenario: Cmd+K opens the switcher modal
    Given the main view is displayed
    When the user presses Cmd+K (or Ctrl+K)
    Then a modal overlay appears with a text input and room list

  Scenario: Escape closes the switcher
    Given the switcher is open
    When the user presses Escape
    Then the switcher closes and focus returns to the previous context

  Scenario: Typing filters the room list
    Given the switcher is open
    When the user types a query
    Then only rooms whose names contain the query are shown

  Scenario: Arrow keys navigate the filtered list
    Given the switcher is open with filtered results
    When the user presses the down arrow
    Then the next item in the list is highlighted
    When the user presses the up arrow
    Then the previous item is highlighted

  Scenario: Enter selects the highlighted room
    Given the switcher is open with an item highlighted
    When the user presses Enter
    Then that room is selected and the switcher closes

  Scenario: Clicking a room selects it
    Given the switcher is open
    When the user clicks a room in the list
    Then that room is selected and the switcher closes

  Scenario: Default selection prefers matching rooms over create-new
    Given the switcher is open
    And there is a room named "nerve"
    When the user types "ner"
    Then the first matching room is selected by default
    And the "Create new #ner" option appears below the matches
    And pressing Enter selects the existing room, not the create option
