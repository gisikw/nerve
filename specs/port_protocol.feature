Feature: Port Protocol
  Communication between Elm and Tauri via the JS glue layer.
  Two ports only: sendToTauri (out) and receiveFromTauri (in).

  Scenario: Outgoing commands use tagged envelope format
    Given Elm sends a command via sendToTauri
    Then the payload is a JSON object with "command" and "args" fields

  Scenario: Incoming responses use tagged envelope format
    Given the JS glue receives a Tauri response
    Then it sends a JSON object with "tag" and "payload" fields to receiveFromTauri

  Scenario: Command names are mapped to Tauri snake_case
    Given Elm sends command "listRooms"
    Then the JS glue invokes Tauri command "list_rooms"

  Scenario: Tauri errors are sent as error tags
    Given a Tauri invoke call throws an error
    Then the JS glue sends a response with tag "error" and the error string as payload

  Scenario: Unknown commands produce error responses
    Given Elm sends a command not in the command map
    Then the JS glue sends an error response

  Scenario: Session check fires on startup
    Given the app initializes with Tauri available
    Then the JS glue automatically invokes check_session
    And sends the result to receiveFromTauri with tag "checkSession"

  Scenario: Six commands are supported
    The command map includes exactly:
      | Elm command   | Tauri command |
      | checkSession  | check_session |
      | login         | login         |
      | logout        | logout        |
      | listRooms     | list_rooms    |
      | getMessages   | get_messages  |
      | sendMessage   | send_message  |
