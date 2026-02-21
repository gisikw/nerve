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
