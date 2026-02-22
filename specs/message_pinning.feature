Feature: Message Pinning
  Users can pin and unpin messages in rooms. Pinned messages appear
  in a collapsible bar above the message list and are visually marked
  in the timeline.

  Scenario: Get pinned events for a room with no pins
    Given a room has no pinned messages
    When pinned events are requested for the room
    Then an empty list is returned

  Scenario: Pin a message in a room
    Given a room with a message
    When the message is pinned
    Then the message event ID is added to the room's pinned events

  Scenario: Pin multiple messages in a room
    Given a room with multiple messages
    When three messages are pinned
    Then all three event IDs appear in the room's pinned events list

  Scenario: Unpin a message from a room
    Given a room with a pinned message
    When the message is unpinned
    Then the message event ID is removed from the room's pinned events

  Scenario: Pinning an already-pinned message is idempotent
    Given a room with a message that is already pinned
    When the message is pinned again
    Then the pinned events list contains the event ID exactly once

  Scenario: Unpinning a message that is not pinned is a no-op
    Given a room with no pinned messages
    When an arbitrary event ID is unpinned
    Then the pinned events list remains empty

  Scenario: Pinned bar appears when room has pinned messages
    Given a room with one pinned message
    When the message list is rendered
    Then the pinned bar is visible
    And the pinned bar shows "1 pinned"

  Scenario: Pinned bar is hidden when room has no pinned messages
    Given a room with no pinned messages
    When the message list is rendered
    Then the pinned bar is not visible

  Scenario: Pinned bar shows count of pinned messages
    Given a room with five pinned messages
    When the message list is rendered
    Then the pinned bar shows "5 pinned"

  Scenario: Pinned bar can be expanded to show previews
    Given a room with pinned messages
    And the pinned bar is collapsed
    When the user clicks the pinned bar header
    Then the pinned bar expands
    And previews of pinned messages are displayed

  Scenario: Pinned bar can be collapsed to hide previews
    Given a room with pinned messages
    And the pinned bar is expanded
    When the user clicks the pinned bar header
    Then the pinned bar collapses
    And previews of pinned messages are hidden

  Scenario: Pinned message preview shows sender and body
    Given a room with a pinned message from "alice" with body "Important announcement"
    When the pinned bar is expanded
    Then the preview shows "alice" as the sender
    And the preview shows "Important announcement" as the body

  Scenario: Pinned message preview truncates long bodies
    Given a room with a pinned message with a body longer than 120 characters
    When the pinned bar is expanded
    Then the preview body is truncated to 120 characters

  Scenario: Pinned messages can be unpinned from the preview
    Given a room with a pinned message
    And the pinned bar is expanded
    When the user clicks "Unpin" on the message preview
    Then the message is removed from the pinned events
    And the pinned bar updates to reflect the change

  Scenario: Pinned indicator appears on pinned messages in timeline
    Given a room with a pinned message
    When the message list is rendered
    Then the pinned message has the "pinned" CSS class

  Scenario: Unpinned messages do not have pinned indicator
    Given a room with an unpinned message
    When the message list is rendered
    Then the message does not have the "pinned" CSS class

  Scenario: Pin button shows correct state for unpinned message
    Given a message that is not pinned
    When the message action buttons are rendered
    Then the pin button title is "Pin"

  Scenario: Pin button shows correct state for pinned message
    Given a message that is already pinned
    When the message action buttons are rendered
    Then the pin button title is "Unpin"

  Scenario: Clicking pin button on unpinned message pins it
    Given a message that is not pinned
    When the user clicks the pin button
    Then the message is pinned
    And the pinned events list is refreshed

  Scenario: Clicking pin button on pinned message unpins it
    Given a message that is already pinned
    When the user clicks the pin button
    Then the message is unpinned
    And the pinned events list is refreshed

  Scenario: Pinned state resets when switching rooms
    Given a room with pinned messages
    And the pinned bar is expanded
    When the user switches to a different room
    Then the pinned bar state is reset
    And pinned events are fetched for the new room

  Scenario: Empty room with no pinned messages shows no pinned bar
    Given an empty room with no messages and no pins
    When the message list is rendered
    Then the pinned bar is not visible

  Scenario: Pinned events fetch failure is logged but not shown to user
    Given a room is selected
    When fetching pinned events fails
    Then the error is logged to the console
    And no toast is displayed to avoid interrupting the user
    And the pinned bar remains hidden
