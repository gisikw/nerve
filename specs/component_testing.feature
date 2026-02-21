Feature: Component testing infrastructure

  Background:
    The UI layer includes Svelte 5 components that render user interfaces, handle
    DOM interactions (focus, scroll, keyboard navigation), and provide accessible
    markup. Component tests verify that these behaviors work correctly without
    requiring a full Tauri environment or manual browser testing.

    Component tests use @testing-library/svelte to render components in a JSDOM
    environment (simulated browser DOM) and assert on their rendered output,
    accessibility attributes, and event handling.

  Scenario: Component rendering with props
    Given a Svelte component that accepts props
    When the component is rendered with specific prop values
    Then the component's DOM output reflects those props
    And the rendered markup is semantically correct

  Scenario: User interaction events
    Given a component with interactive elements (buttons, inputs)
    When a user triggers an event (click, keypress, input)
    Then the component's event handler executes
    And the component's state updates accordingly
    And the DOM reflects the new state

  Scenario: Accessibility attributes
    Given a component that requires accessible markup
    When the component is rendered
    Then ARIA attributes are correctly applied
    And semantic HTML elements are used appropriately
    And screen reader text is provided where needed

  Scenario: DOM queries and assertions
    Given a rendered component
    When querying elements by role, label, or test ID
    Then elements are found using accessible queries first
    And test assertions verify element properties (text, attributes, visibility)
    And assertions use @testing-library/jest-dom matchers for clarity
