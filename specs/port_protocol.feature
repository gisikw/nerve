Feature: IPC Protocol
  Communication between the Svelte frontend and Tauri backend via the
  typed IPC wrapper (src/lib/tauri.ts).

  Scenario: Commands use Tauri invoke with snake_case names
    Given the frontend calls a typed IPC function
    Then the wrapper invokes the corresponding Tauri command

  Scenario: Tauri errors are surfaced to the caller
    Given a Tauri invoke call throws an error
    Then the IPC wrapper propagates the error to the caller

  Scenario: Session check fires on startup
    Given the app initializes with Tauri available
    Then the app invokes check_session on mount

  Scenario: Core commands are supported
    The IPC wrapper includes at minimum:
      | Function      | Tauri command     |
      | checkSession  | check_session     |
      | login         | login             |
      | logout        | logout            |
      | listRooms     | list_rooms        |
      | getMessages   | get_messages      |
      | sendMessage   | send_message      |
      | sendReaction  | send_reaction     |
      | getMedia      | get_media         |
      | speakText     | speak_text        |
      | sendImage     | send_image        |
      | markRead      | mark_read         |
      | getPinnedEvents | get_pinned_events |
      | pinMessage    | pin_message       |
      | unpinMessage  | unpin_message     |
      | getStreams    | get_streams       |
      | sendStreamAction | send_stream_action |
      | createRoom    | create_room       |
