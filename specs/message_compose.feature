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

  Scenario: Start voice recording
    Given the user has a room selected
    When the user clicks the microphone button
    Then the browser requests microphone permission
    And the recording state becomes active
    And the microphone button icon changes to a stop icon

  Scenario: Stop voice recording and send
    Given a voice recording is in progress
    When the user clicks the stop button
    Then the recording stops
    And the audio is converted to base64
    And a voice message is sent to the selected room
    And the recording state becomes inactive
    And the microphone button icon reverts to the microphone icon

  Scenario: Voice recording without room selected
    Given no room is selected
    When the user clicks the microphone button
    Then no recording starts

  Scenario: Voice recording prefers opus codec
    Given the browser supports audio/webm with opus codec
    When a voice recording starts
    Then the MediaRecorder uses audio/webm;codecs=opus

  Scenario: Voice recording fallback codec
    Given the browser does not support opus codec
    When a voice recording starts
    Then the MediaRecorder uses audio/webm as fallback

  Scenario: Voice recording duration is tracked
    Given a voice recording is started
    When the recording runs for 5 seconds
    And the user stops the recording
    Then the voice message includes a duration of approximately 5000ms

  Scenario: Microphone permission denied
    Given the user clicks the microphone button
    When the browser denies microphone permission
    Then the recording state remains inactive
    And an error is logged to the console

  Scenario: Empty recording is not sent
    Given a voice recording is started
    When the recording is stopped immediately with no audio data
    Then no voice message is sent

  Scenario: Voice recording cleans up media stream
    Given a voice recording is in progress
    When the user stops the recording
    Then all media stream tracks are stopped
    And system resources are released

  Scenario: Component unmount during recording
    Given a voice recording is in progress
    When the component is unmounted
    Then the recording is stopped
    And all media stream tracks are stopped

  Scenario: Voice recording start without room is logged
    Given no room is selected
    When the user clicks the microphone button
    Then a warning is logged to the console
    And no recording starts

  Scenario: Voice recording stop with no data is logged
    Given a voice recording is started
    When the recording is stopped with no audio chunks
    Then a warning is logged to the console
    And no voice message is sent

  Scenario: Voice recording send failure is logged
    Given a voice recording completes successfully
    When the backend send_voice_message command fails
    Then the error is logged to the console

  Scenario: Voice recording logs microphone access request
    Given the user clicks the microphone button
    When microphone access is requested
    Then the request is logged to the console

  Scenario: Voice recording logs MIME type selection
    Given the user starts a voice recording
    When the MIME type is selected
    Then the selected MIME type is logged to the console

  Scenario: Voice recording logs audio chunks received
    Given a voice recording is in progress
    When audio data chunks are received
    Then each chunk size is logged to the console

  Scenario: Voice recording logs send details
    Given a voice recording completes
    When the voice message is sent
    Then the blob size, duration, and MIME type are logged to the console
