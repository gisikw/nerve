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

  Scenario: Rooms are sorted by group then by last activity
    Given the switcher is open
    And there is a room "ops" with mentions (highlight_count > 0)
    And there is a room "general" with unreads (notification_count > 0)
    And there is a room "nerve" that is read
    And there is a room "archive" that is archived
    And "ops" has last_activity of 100
    And "general" has last_activity of 200
    And "nerve" has last_activity of 300
    Then the rooms are displayed in this order:
      | ops (mentioned)
      | general (unread)
      | nerve (read)
      | archive (archived)

  Scenario: Within each group, rooms are sorted by last activity descending
    Given the switcher is open
    And there is a room "alpha" with last_activity of 100
    And there is a room "beta" with last_activity of 300
    And there is a room "gamma" with last_activity of 200
    And all three rooms have no unreads
    Then the rooms are displayed in this order:
      | beta (last_activity: 300)
      | gamma (last_activity: 200)
      | alpha (last_activity: 100)

  Scenario: Mentioned rooms appear first regardless of last activity
    Given the switcher is open
    And there is a room "old-mention" with highlight_count of 1 and last_activity of 100
    And there is a room "new-unread" with notification_count of 5 and last_activity of 500
    Then "old-mention" appears before "new-unread"

  Scenario: Archived rooms appear last regardless of unreads or activity
    Given the switcher is open
    And there is a room "archived-busy" that is archived with notification_count of 10
    And there is a room "active-read" that is not archived with no unreads
    And "archived-busy" has last_activity of 500
    And "active-read" has last_activity of 100
    Then "active-read" appears before "archived-busy"

  Scenario: Create new option is not visually bold
    Given the switcher is open
    And the user types a room name that does not exist
    When the "Create new" option is displayed
    Then the room name text is rendered with normal font weight
    And no part of the option appears bold or highlighted beyond the selection indicator

  Scenario: Channels with unreads appear bold in the switcher
    Given the switcher is open
    And there is a room "general" with notification_count of 3
    And there is a room "ops" with highlight_count of 1
    And there is a room "quiet" with no unreads
    Then "general" is rendered with bold font weight
    And "ops" is rendered with bold font weight
    And "quiet" is rendered with normal font weight

  Scenario: Input field has spellcheck disabled
    Given the switcher is open
    When the user types in the filter input
    Then the browser does not display spellcheck indicators (red squiggles)
    And the input element has spellcheck attribute set to false
