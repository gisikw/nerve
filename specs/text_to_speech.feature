Feature: Text-to-Speech Playback
  Speaking message text aloud via TTS synthesis and audio playback.

  Scenario: Speak button synthesizes and plays audio
    Given a message with text content
    When the user clicks the speak button
    Then the text is sent to the TTS synthesizer
    And the returned audio is queued for playback

  Scenario: Audio plays sequentially from queue
    Given multiple messages are spoken in quick succession
    Then audio clips play in the order they were queued
    And each clip completes before the next begins

  Scenario: AudioContext is unlocked during user gesture
    Given the user has not yet interacted with audio playback
    When the user clicks the speak button
    Then the AudioContext is created or resumed synchronously
    And subsequent async audio can play without additional gestures

  Scenario: Queue processes automatically when idle
    Given the playback queue is empty
    When new audio is enqueued
    Then playback starts automatically

  Scenario: Queue waits during active playback
    Given audio is currently playing
    When new audio is enqueued
    Then the new audio waits until current playback completes

  Scenario: Stop all clears queue and halts playback
    Given audio is playing and more audio is queued
    When stop all is called
    Then current playback is stopped immediately
    And all queued audio is removed

  Scenario: TTS synthesis truncates long text
    Given a message body longer than 500 characters
    When the message is sent to TTS synthesis
    Then only the first 500 characters are synthesized

  Scenario: TTS returns base64-encoded mp3 data
    Given text is successfully synthesized
    Then the backend returns base64-encoded audio data
    And the frontend decodes it to an ArrayBuffer for playback

  Scenario: Decode failure skips to next queued item
    Given audio data that fails to decode
    When the decode error occurs
    Then the current item is discarded
    And the next queued item begins playback

  Scenario: TTS synthesis failure is logged
    Given the TTS backend command fails
    When the speak button is clicked
    Then the error is logged to the console
    And no audio is enqueued for playback

  Scenario: Empty TTS response is logged
    Given the TTS backend returns an empty response
    When the speak button is clicked
    Then a warning is logged to the console
    And no audio is enqueued for playback

  Scenario: Fort command not found is logged
    Given the fort command is not available
    When TTS synthesis is requested
    Then the backend logs the command failure
    And returns an error to the frontend

  Scenario: Fort TTS timeout is logged
    Given the TTS output file is not created within the timeout
    When TTS synthesis is requested
    Then the backend logs the timeout
    And returns an error to the frontend
