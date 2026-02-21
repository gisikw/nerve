Feature: Streams Panel
  Stream/channel output panel showing process execution and interactive buttons.

  Scenario: Panel auto-opens when active streams appear
    Given the streams panel is closed
    And a room is selected
    When a new active stream is received
    Then the streams panel opens automatically

  Scenario: Panel remains closed if streams are already done
    Given the streams panel is closed
    And a room is selected
    When streams are received with all streams marked as closed
    Then the streams panel remains closed

  Scenario: Panel close button closes the panel
    Given the streams panel is open
    When the user clicks the close button
    Then the streams panel closes

  Scenario: Panel toggle function opens the panel
    Given the streams panel is closed
    When the toggle function is called
    Then the streams panel opens

  Scenario: Panel toggle function closes the panel
    Given the streams panel is open
    When the toggle function is called
    Then the streams panel closes

  Scenario: Active stream count appears in header
    Given a room has 3 active streams
    When the streams panel is rendered
    Then the header displays "Streams (3)"

  Scenario: Header shows no count when all streams are closed
    Given a room has 2 closed streams
    When the streams panel is rendered
    Then the header displays "Streams" without a count

  Scenario: Stream accordion starts expanded
    Given a stream is displayed in the panel
    And the stream has not been interacted with
    Then the stream output is visible

  Scenario: Clicking stream header toggles collapse
    Given a stream is displayed and expanded
    When the user clicks the stream header toggle
    Then the stream output becomes hidden
    When the user clicks the stream header toggle again
    Then the stream output becomes visible again

  Scenario: Collapsed state is tracked per stream
    Given two streams "build" and "test" are displayed
    When the user collapses "build"
    Then "build" output is hidden
    And "test" output remains visible

  Scenario: Collapsed state resets on room switch
    Given a stream in room "nerve" is collapsed
    When the user switches to room "ops"
    Then all streams in "ops" start expanded

  Scenario: Stream button click sends action
    Given a stream has a button with id "stop" and label "Stop"
    When the user clicks the "Stop" button
    Then the sendStreamAction command is called with the stream ID and button ID "stop"

  Scenario: Multiple buttons are rendered for a stream
    Given a stream has buttons "Restart" (id: restart) and "Stop" (id: stop)
    When the stream is rendered
    Then both "Restart" and "Stop" buttons are visible

  Scenario: Closed stream shows status indicator
    Given a stream is marked as closed
    When the stream is rendered
    Then the stream header displays "done" status

  Scenario: Active stream does not show status indicator
    Given a stream is not marked as closed
    When the stream is rendered
    Then the stream header does not display a status indicator

  Scenario: Stream lines display with channel styling
    Given a stream has a line with channel "stderr" and text "error: failed"
    And a stream has a line with channel "stdout" and text "success"
    When the stream output is rendered
    Then the stderr line has the "stderr" CSS class
    And the stdout line does not have the "stderr" CSS class

  Scenario: Chevron icon indicates collapse state
    Given a stream is expanded
    When the stream header is rendered
    Then the chevron points down
    When the stream is collapsed
    Then the chevron points right

  Scenario: Empty streams show placeholder message
    Given a room has no streams
    When the streams panel is rendered
    Then "No active streams." is displayed

  Scenario: Streams list is rendered when streams exist
    Given a room has streams
    When the streams panel is rendered
    Then the streams list is visible
    And the "No active streams." message is not displayed

  Scenario: Panel fetches streams on room selection
    Given the user selects a room
    When the room ID changes
    Then the getStreams command is called with the room ID

  Scenario: Stream state is isolated per room
    Given room "nerve" has stream "build"
    And room "ops" has stream "deploy"
    When the user switches to room "nerve"
    Then only stream "build" is displayed
    When the user switches to room "ops"
    Then only stream "deploy" is displayed

  Scenario: Stream CSS classes distinguish active and closed streams
    Given a stream is active (not closed)
    When the stream is rendered
    Then the stream has the "stream-active" CSS class
    And the stream does not have the "stream-closed" CSS class
    Given a stream is closed
    When the stream is rendered
    Then the stream has the "stream-closed" CSS class
    And the stream does not have the "stream-active" CSS class
