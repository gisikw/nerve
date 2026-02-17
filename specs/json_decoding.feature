Feature: JSON Decoding
  The Elm frontend decodes JSON responses from the Rust backend.
  Decoders must handle the exact field names and types that serde
  produces from the Rust structs.

  Scenario: Decode a room
    Given a JSON object with fields id, name, is_direct, notification_count
    When decoded as a Room
    Then it produces a Room record with matching fields

  Scenario: Decode a room list
    Given a JSON array of room objects
    When decoded as a room list
    Then it produces a list of Room records

  Scenario: Decode an empty room list
    Given an empty JSON array
    When decoded as a room list
    Then it produces an empty list

  Scenario: Decode a text message without media
    Given a JSON object with event_id, sender, body, timestamp, msg_type
    And msg_type is "text"
    And media_url is absent
    When decoded as a Message
    Then mediaUrl is Nothing

  Scenario: Decode an image message with media URL
    Given a JSON object with event_id, sender, body, timestamp, msg_type, media_url
    And msg_type is "image"
    When decoded as a Message
    Then mediaUrl is Just the URL

  Scenario: Decode a logged-in session
    Given a JSON object with logged_in true and user_id present
    When decoded as a SessionStatus
    Then loggedIn is True and userId is Just the user ID

  Scenario: Decode a logged-out session
    Given a JSON object with logged_in false and no user_id field
    When decoded as a SessionStatus
    Then loggedIn is False and userId is Nothing

  Scenario: Decode a login result
    Given a JSON object with user_id
    When decoded as a LoginResult
    Then userId matches the value
