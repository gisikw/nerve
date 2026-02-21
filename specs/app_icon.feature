Feature: App Icon

  The app icon must render with smooth, continuous rounded corners matching
  macOS/iOS design language (squircle/superellipse), not faceted/octagonal
  corners from simple border-radius application.

  Background:
    Given the app icon source is defined in src-tauri/icons/icon.svg
    And the app icon is built as src-tauri/icons/icon.png

  Scenario: Icon has smooth rounded corners
    When the icon is rendered at full resolution
    Then the corners should use continuous curves (squircle path)
    And the corners should not appear faceted or octagonal
    And the icon should match the quality of system-generated app icons

  Scenario: Icon maintains quality at high zoom
    When the icon is zoomed to 200% or greater
    Then the rounded corners should remain smooth
    And there should be no visible pixelation on corner edges
    And anti-aliasing should be applied to all curves

  Scenario: Icon is generated from SVG at proper resolution
    Given the icon.svg contains a squircle clip path
    When the PNG is generated from the SVG
    Then it should be rendered at 1024x1024 pixels minimum
    And the squircle path should be preserved in the rasterization
    And proper anti-aliasing should be applied during conversion

  Scenario: Icon uses continuous bezier curves not line segments
    Given the icon.svg contains a squircle path definition
    When inspecting the SVG path data
    Then the corners should use cubic bezier curves (C commands)
    And the path should not use only straight lines with arc transitions
    And the bezier curves should create smooth continuous corners
