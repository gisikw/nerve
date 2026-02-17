Feature: Session Management
  Login, logout, and session restoration flows.

  Scenario: App starts on login page
    Given the app has just initialized
    Then the login page is displayed
    And no rooms or messages are loaded

  Scenario: Check session finds active session
    Given the backend responds to checkSession with logged_in true
    Then the app transitions to the main page
    And the user ID is displayed
    And room list loading begins

  Scenario: Check session finds no session
    Given the backend responds to checkSession with logged_in false
    Then the app stays on the login page

  Scenario: Session persists across app restarts
    Given the user previously logged in to a homeserver
    And the app is restarted
    When check_session runs on startup
    Then the backend restores the client from the saved homeserver and sqlite store
    And the app transitions to the main page without requiring login

  Scenario: Login saves homeserver for future session restore
    Given the user logs in with homeserver "example.chat"
    Then the homeserver is persisted to disk

  Scenario: Logout clears saved session
    Given the user logs out
    Then the saved homeserver is removed
    And the next app launch will require login

  Scenario: Successful login
    Given the user fills in homeserver, username, and password
    And submits the login form
    And the backend responds with a user_id
    Then the app transitions to the main page
    And the login form password is cleared
    And room list loading begins

  Scenario: Failed login shows error
    Given the user submits the login form
    And the backend returns an error
    Then the login page displays the error message
    And the loading state is cleared

  Scenario: Login form shows loading state
    Given the user submits the login form
    Then the submit button shows "Connecting..."
    And the form inputs are disabled

  Scenario: Logout returns to login page
    Given the user is on the main page
    And clicks the logout button
    Then the app transitions to the login page
    And rooms and messages are cleared
