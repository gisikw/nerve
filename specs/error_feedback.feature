Feature: Error Feedback
  Transient error notifications displayed to the user via toast messages.

  Scenario: Toast appears when message send fails
    Given a message send operation fails
    Then a toast notification appears with the error message
    And the toast has an error style

  Scenario: Toast appears when image send fails
    Given an image send operation fails
    Then a toast notification appears with "Failed to send image"
    And the toast has an error style

  Scenario: Toast appears when voice message send fails
    Given a voice message send operation fails
    Then a toast notification appears with "Failed to send voice message"
    And the toast has an error style

  Scenario: Toast auto-dismisses after duration
    Given a toast is displayed
    When 5 seconds elapse
    Then the toast is automatically removed

  Scenario: Toast can be manually dismissed
    Given a toast is displayed
    When the user clicks the dismiss button
    Then the toast is immediately removed

  Scenario: Multiple toasts can be displayed
    Given multiple errors occur
    Then multiple toasts are displayed
    And they are stacked vertically

  Scenario: Toast container is positioned bottom-right
    Given a toast is displayed
    Then the toast container is fixed to the bottom-right of the viewport

  Scenario: Error toasts have error styling
    Given an error toast is displayed
    Then the toast has a red left border
    And uses the --error design token

  Scenario: Info toasts have info styling
    Given an info toast is displayed
    Then the toast has a blue left border
    And uses the --accent design token

  Scenario: Toasts have slide-in animation
    Given a toast is added
    Then the toast animates in from the right
    And the animation takes 200ms

  Scenario: Toasts use design tokens
    Given a toast is displayed
    Then the background uses --bg-surface
    And the border uses --border
    And the text uses --text

  Scenario: Toast message is readable
    Given a toast with a long error message is displayed
    Then the message wraps within the toast
    And the toast has a max-width of 400px

  Scenario: Typing notice failures are logged but not shown
    Given a typing notice send fails
    Then the error is logged to the console
    And no toast is displayed

  Scenario: Background operations log errors without toasts
    Given a background operation fails
    Then the error is logged to the console
    And no toast is displayed to avoid interrupting the user
