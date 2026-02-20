Feature: JSON Decoding
  The frontend consumes JSON responses from the Rust backend.
  Types must handle the exact field names and shapes that serde
  produces from the Rust structs.

  Scenario: Decode a room
    Given a JSON object with fields id, name, is_direct, notification_count
    When consumed as a Room
    Then it produces a Room object with matching fields

  Scenario: Decode a room list
    Given a JSON array of room objects
    When consumed as a room list
    Then it produces a list of Room objects

  Scenario: Decode an empty room list
    Given an empty JSON array
    When consumed as a room list
    Then it produces an empty list

  Scenario: Decode a text message without media
    Given a JSON object with event_id, sender, body, timestamp, msg_type
    And msg_type is "text"
    And media_url is absent
    When consumed as a Message
    Then media_url is undefined

  Scenario: Decode an image message with media URL
    Given a JSON object with event_id, sender, body, timestamp, msg_type, media_url
    And msg_type is "image"
    When consumed as a Message
    Then media_url is the URL string

  Scenario: Decode a logged-in session
    Given a JSON object with logged_in true and user_id present
    When consumed as a SessionStatus
    Then logged_in is true and user_id is the user ID string

  Scenario: Decode a logged-out session
    Given a JSON object with logged_in false and no user_id field
    When consumed as a SessionStatus
    Then logged_in is false and user_id is null

  Scenario: Decode a login result
    Given a JSON object with user_id
    When consumed as a LoginResult
    Then user_id matches the value
