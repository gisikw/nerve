Perfect! I've written a comprehensive plan for implementing this ticket. The plan covers:

**Summary:**
The ticket requires replacing the current localStorage-based archived room tracking with Matrix's standard `m.lowpriority` tag from the server. This involves:

1. **Backend changes** (Rust):
   - Adding `is_low_priority` field to `RoomInfo` 
   - Querying the Matrix SDK's `room.is_low_priority()` method
   - Creating a new `set_room_low_priority` Tauri command

2. **Frontend changes** (TypeScript/Svelte):
   - Removing all localStorage persistence code
   - Updating type definitions to include `is_low_priority`
   - Refactoring room grouping logic to use the server field instead of local state
   - Updating components (Sidebar, ChannelSwitcher) to work with the new data source

3. **Test updates**:
   - Removing localStorage-related tests
   - Updating room grouping tests to use the new field
   - Adding fake backend support

4. **Spec updates**:
   - Clarifying that archive state is now server-managed via Matrix tags

The plan has 17 concrete tasks with clear verification steps. There are no open questions since the matrix-rust-sdk already provides the necessary APIs.
