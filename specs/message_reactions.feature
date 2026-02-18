Feature: Message Reactions
  Emoji reactions on messages — display, sending, and aggregation.

  Scenario: Reactions display as pills below a message
    Given a message has reactions
    Then each unique emoji is shown as a pill with emoji and count

  Scenario: Reactions are sorted by count descending
    Given a message has multiple distinct reactions
    Then they are displayed in descending count order

  Scenario: Self-reactions are visually distinguished
    Given the current user has reacted to a message
    Then that reaction pill has the "self" CSS class

  Scenario: Clicking a reaction pill sends that reaction
    Given a message is displayed with reactions
    When the user clicks a reaction pill
    Then a send_reaction command is issued with the emoji and event ID

  Scenario: Reaction aggregation deduplicates by sender
    Given the same user sends the same emoji twice
    Then the reaction count reflects unique senders only
