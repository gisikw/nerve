Feature: Message Display
  Rendering messages in the chat area, including grouping,
  images, and special message types.

  Scenario: Messages display in chronological order
    Given a room has messages
    Then messages are rendered in timestamp order

  Scenario: Consecutive messages from same sender are grouped
    Given two messages from the same sender
    And the second is within 5 minutes of the first
    Then only the first message shows the sender name and timestamp

  Scenario: Messages more than 5 minutes apart start a new group
    Given two messages from the same sender
    And the second is more than 5 minutes after the first
    Then both messages show sender name and timestamp

  Scenario: Different senders start a new group
    Given two consecutive messages from different senders
    Then both messages show sender name and timestamp

  Scenario: Sender name strips server suffix
    Given a message from "@alice:matrix.org"
    Then the displayed sender is "alice"

  Scenario: Image messages render inline
    Given a message with msg_type "image" and a media_url
    Then an img element is rendered with the media URL as src

  Scenario: Notice messages are styled differently
    Given a message with msg_type "notice"
    Then the message has the "notice" CSS class

  Scenario: Empty room shows placeholder
    Given a room has no messages
    Then the chat area shows "No messages yet."

  Scenario: Messages auto-scroll to bottom on new messages
    Given the user is scrolled to the bottom of the messages area
    When new messages arrive
    Then the messages area scrolls to the bottom

  Scenario: Scroll-back position is preserved
    Given the user has scrolled up in the messages area
    When new messages arrive
    Then the scroll position is not changed

  Scenario: Messages poll periodically when room is selected
    Given a room is selected
    Then messages refresh every 3 seconds

  Scenario: Messages do not poll when no room is selected
    Given no room is selected
    Then no message polling occurs
