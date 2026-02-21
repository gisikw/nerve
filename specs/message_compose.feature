Feature: Message Compose
  Sending messages from the compose bar.

  Scenario: Sending a message clears the input
    Given the user types a message and submits
    Then the compose input is cleared

  Scenario: Enter key submits the message
    Given the user is focused on the compose input
    When the user presses Enter without Shift
    Then the message is submitted
    And the default newline is prevented

  Scenario: Shift+Enter inserts a newline
    Given the user is focused on the compose input
    When the user presses Shift+Enter
    Then a newline is inserted
    And the message is not submitted

  Scenario: Empty messages are not sent
    Given the compose input contains only whitespace
    When the user submits
    Then no message is sent
    And the input is not cleared

  Scenario: No room selected prevents sending
    Given no room is selected
    When the user types and submits
    Then no message is sent

  Scenario: After sending, messages refresh
    Given a message is successfully sent
    Then the message list refreshes for the current room

  Scenario: Textarea height resets after sending
    Given the user has typed a multi-line message
    When the user submits the message
    Then the compose textarea collapses to single-line height

  Scenario: Image attachment via paste
    Given the user is focused on the compose input
    When the user pastes an image from the clipboard
    Then the image preview is displayed
    And the compose input placeholder changes to "Add a message..."

  Scenario: Image attachment via drag and drop
    Given a file is dragged over the application
    And the file is an image
    When the file is dropped
    Then the image preview is displayed
    And the drop overlay is hidden

  Scenario: Sending image with caption
    Given an image is attached
    And the user types a caption
    When the user submits
    Then the image is sent with the caption
    And the attachment preview is cleared
    And the caption text is cleared

  Scenario: Sending image without caption
    Given an image is attached
    And the compose input is empty
    When the user submits
    Then the image is sent with no caption
    And the attachment preview is cleared

  Scenario: Removing image attachment
    Given an image is attached
    When the user clicks the remove attachment button
    Then the attachment preview is cleared
    And the compose input placeholder reverts to "Send a message..."

  Scenario: Only one image attachment at a time
    Given an image is attached
    When the user attaches a different image
    Then the first image is replaced with the second

  Scenario: Non-image files are ignored on paste
    Given the user is focused on the compose input
    When the user pastes non-image content
    Then no attachment preview is displayed

  Scenario: Non-image files are ignored on drop
    Given a non-image file is dragged and dropped
    Then no attachment preview is displayed

  Scenario: MIME type detection for images
    Given an image file without MIME type metadata
    When the file is attached
    Then the MIME type is inferred from the file extension

  Scenario: Unknown image formats are rejected
    Given an image file with an unknown extension
    When the file is processed for sending
    Then the attachment is cleared without sending
