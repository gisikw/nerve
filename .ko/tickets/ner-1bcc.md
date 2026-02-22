---
id: ner-1bcc
status: closed
deps: []
links: []
created: 2026-02-22T00:27:50Z
type: task
priority: 2
---
# Reconcile spec/test naming: establish convention mapping specs/foo_bar.feature to test files, fix inconsistencies

## Notes

**2026-02-22 01:47:49 UTC:** ko: FAIL at node 'triage' — Ticket requires architectural decision: Should we enforce ONE naming style (kebab-case, snake_case, or PascalCase) for spec-to-test mapping, or keep all three as acceptable? INVARIANTS.md currently allows all three. Need clarification on whether to: (1) pick one style and rename all tests to match, or (2) simply ensure test names map recognizably to spec names regardless of style. Recommend option 1 with kebab-case based on existing usage patterns.

**2026-02-22 05:01:15 UTC:** ko: FAIL at node 'triage' — Architectural decision required: INVARIANTS.md line 86-90 explicitly permits three naming styles (kebab-case, snake_case, PascalCase) for spec-to-test mapping. Ticket requires choosing: (1) enforce single style (recommend kebab-case based on frontend conventions), or (2) keep all three styles valid but ensure semantic equivalence (e.g., error_feedback→toasts violates this). Current codebase shows kebab-case as dominant pattern for multi-word test files. Need human decision on whether to standardize or maintain flexibility.

**2026-02-22 06:16:43 UTC:** ko: FAIL at node 'verify' — node 'verify' failed after 3 attempts: command failed: exit status 1
warning: Git tree '/home/dev/Projects/nerve' is dirty
nerve dev shell
  just dev      — run Tauri (hot-reload)
  just dev-ui   — run frontend only (fake backend)
  just test     — run full test suite
  just build    — build release binary
  just          — list all recipes
cd ui && [ -x node_modules/.bin/vitest ] || npm install
cd ui && npx vitest run

 RUN  v3.2.4 /home/dev/Projects/nerve/ui

 ✓ src/lib/markdown.test.ts (16 tests) 54ms
 ❯ src/lib/spec-test-naming.test.ts (8 tests | 3 failed) 55ms
   × Spec-to-Test Naming Convention > All specs have corresponding tests > every spec file has at least one test file 32ms
     → The following specs have no corresponding tests:
markdown_rendering.feature
message_truncation.feature
room_archiving.feature
scroll_behavior.feature
session_management.feature
   ✓ Spec-to-Test Naming Convention > Naming convention follows documented pattern > spec names use snake_case 4ms
   × Spec-to-Test Naming Convention > Naming convention follows documented pattern > multi-word test files use kebab-case (primary pattern) 3ms
     → expected 0 to be greater than 0
   ✓ Spec-to-Test Naming Convention > Semantic equivalence > error_feedback.feature maps to error-feedback.test.ts 1ms
   ✓ Spec-to-Test Naming Convention > Semantic equivalence > text_to_speech.feature maps to text-to-speech.test.ts 1ms
   ✓ Spec-to-Test Naming Convention > Semantic equivalence > message_compose.feature maps to message-compose.test.ts 1ms
   ✓ Spec-to-Test Naming Convention > INVARIANTS.md documents the convention > INVARIANTS.md contains spec-to-test naming section 1ms
   × Spec-to-Test Naming Convention > No vacuous tests > spec_test_naming.test.ts actually validates naming 10ms
     → expected 'import { describe, it, expect } from …' not to contain 'expect(true).toBe(true)'
 ❯ src/lib/port-protocol.test.ts (9 tests | 6 failed) 16ms
   ✓ Port Protocol > IPC wrapper structure > exports typed command functions 2ms
   ✓ Port Protocol > IPC wrapper structure > exports invoke function 0ms
   ✓ Port Protocol > IPC wrapper structure > exports TypeScript types for IPC data structures 0ms
   × Port Protocol > Command invocation > checkSession calls check_session command 7ms
     → Cannot set property invoke of [object Module] which has only a getter
   × Port Protocol > Command invocation > login calls login command with correct arguments 1ms
     → Cannot set property invoke of [object Module] which has only a getter
   × Port Protocol > Command invocation > sendMessage calls send_message command with roomId and body 1ms
     → Cannot set property invoke of [object Module] which has only a getter
   × Port Protocol > Command invocation > sendReaction calls send_reaction command with correct arguments 1ms
     → Cannot set property invoke of [object Module] which has only a getter
   × Port Protocol > Error handling > propagates errors from invoke to caller 1ms
     → Cannot set property invoke of [object Module] which has only a getter
   × Port Protocol > Error handling > does not catch or swallow command errors 1ms
     → Cannot set property invoke of [object Module] which has only a getter
 ✓ src/lib/room-navigation.test.ts (21 tests) 12ms
 ✓ src/lib/voice-recording.test.ts (16 tests) 16ms
 ✓ src/lib/stores/rooms.test.ts (23 tests) 26ms
 ✓ src/lib/stores/error-feedback.test.ts (13 tests) 39ms
 ❯ src/lib/component-testing.test.ts (14 tests | 13 failed) 74ms
   × Component testing infrastructure > Component rendering with props > renders component with specified props 27ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > Component rendering with props > produces semantically correct markup 3ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > User interaction events > executes event handlers on user interaction 6ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > User interaction events > handles multiple interactions 2ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > Accessibility attributes > finds elements using accessible queries 2ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > Accessibility attributes > verifies ARIA attributes are correctly applied 2ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > Accessibility attributes > uses semantic HTML elements appropriately 2ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > DOM queries and assertions > queries elements by role 2ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > DOM queries and assertions > queries elements by text content 2ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > DOM queries and assertions > verifies element properties 3ms
     → Component is not a function

	in <unknown>

   × Component testing infrastructure > DOM queries and assertions > checks element visibility 2ms
     → Component is not a function

	in <unknown>

   ✓ Component testing infrastructure > Testing library setup > jsdom environment is available 2ms
   × Component testing infrastructure > Testing library setup > can create and query DOM elements 15ms
     → expected '' to be 'Test content' // Object.is equality
   × Component testing infrastructure > Testing library setup > testing-library matchers are available 1ms
     → Component is not a function

	in <unknown>

 ✓ src/lib/message-reactions.test.ts (12 tests) 15ms
 ✓ src/lib/message-pinning.test.ts (30 tests) 21ms
 ✓ src/lib/scroll.test.ts (16 tests) 12ms
 ✓ src/lib/ui-layout.test.ts (13 tests) 14ms
 ✓ src/lib/message-display.test.ts (25 tests) 16ms
 ✓ src/Toast.test.ts (12 tests) 654ms
   ✓ Toast component > dismisses toast when dismiss button is clicked  356ms
 ✓ src/ComposeBar.test.ts (1 test) 636ms
   ✓ ComposeBar component > textarea height management > resets textarea height to auto after sending a message  634ms
 ✓ src/Login.test.ts (10 tests) 1468ms
   ✓ Login component > rendering with props > renders the login form with all input fields  472ms
   ✓ Login component > user interaction > calls onLogin with form values when submitted  356ms
   ✓ Login component > user interaction > persists homeserver to localStorage on submit  312ms
 ✓ src/lib/json-decoding.test.ts (10 tests) 13ms
 ✓ src/lib/image-attachment.test.ts (14 tests) 21ms
 ✓ src/lib/text-to-speech.test.ts (15 tests) 11ms
 ✓ src/lib/channel-switcher.test.ts (20 tests) 14ms
 ✓ src/lib/streams.test.ts (36 tests) 13ms
 ✓ src/lib/typing-indicators.test.ts (12 tests) 10ms
 ✓ src/lib/app-icon.test.ts (8 tests) 8ms
 ✓ src/lib/truncate.test.ts (7 tests) 6ms
 ✓ src/lib/message-compose.test.ts (6 tests) 5ms
 ✓ src/ChannelSwitcher.test.ts (3 tests) 4ms
 ✓ src/lib/viewport-behavior.test.ts (2 tests) 2ms

⎯⎯⎯⎯⎯⎯ Failed Tests 22 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Component rendering with props > renders component with specified props
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Component rendering with props > produces semantically correct markup
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > User interaction events > executes event handlers on user interaction
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > User interaction events > handles multiple interactions
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Accessibility attributes > finds elements using accessible queries
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Accessibility attributes > verifies ARIA attributes are correctly applied
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Accessibility attributes > uses semantic HTML elements appropriately
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > DOM queries and assertions > queries elements by role
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > DOM queries and assertions > queries elements by text content
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > DOM queries and assertions > verifies element properties
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > DOM queries and assertions > checks element visibility
 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Testing library setup > testing-library matchers are available
TypeError: Component is not a function

	in <unknown>

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/22]⎯

 FAIL  src/lib/component-testing.test.ts > Component testing infrastructure > Testing library setup > can create and query DOM elements
AssertionError: expected '' to be 'Test content' // Object.is equality

[32m- Expected[39m
[31m+ Received[39m

[32m- Test content[39m

 ❯ src/lib/component-testing.test.ts:229:34
    227| 
    228|       const found = document.body.querySelector("div");
    229|       expect(found?.textContent).toBe("Test content");
       |                                  ^
    230| 
    231|       // Cleanup

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/22]⎯

 FAIL  src/lib/port-protocol.test.ts > Port Protocol > Command invocation > checkSession calls check_session command
TypeError: Cannot set property invoke of [object Module] which has only a getter
 ❯ src/lib/port-protocol.test.ts:76:13
     74|       const originalInvoke = tauri.invoke;
     75|       // @ts-expect-error - replacing invoke for testing
     76|       tauri.invoke = mockInvoke;
       |             ^
     77| 
     78|       const result = await tauri.checkSession();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/22]⎯

 FAIL  src/lib/port-protocol.test.ts > Port Protocol > Command invocation > login calls login command with correct arguments
TypeError: Cannot set property invoke of [object Module] which has only a getter
 ❯ src/lib/port-protocol.test.ts:95:13
     93|       const originalInvoke = tauri.invoke;
     94|       // @ts-expect-error - replacing invoke for testing
     95|       tauri.invoke = mockInvoke;
       |             ^
     96| 
     97|       await tauri.login(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/22]⎯

 FAIL  src/lib/port-protocol.test.ts > Port Protocol > Command invocation > sendMessage calls send_message command with roomId and body
TypeError: Cannot set property invoke of [object Module] which has only a getter
 ❯ src/lib/port-protocol.test.ts:118:13
    116|       const originalInvoke = tauri.invoke;
    117|       // @ts-expect-error - replacing invoke for testing
    118|       tauri.invoke = mockInvoke;
       |             ^
    119| 
    120|       await tauri.sendMessage("!room:matrix.org", "Hello world");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/22]⎯

 FAIL  src/lib/port-protocol.test.ts > Port Protocol > Command invocation > sendReaction calls send_reaction command with correct arguments
TypeError: Cannot set property invoke of [object Module] which has only a getter
 ❯ src/lib/port-protocol.test.ts:136:13
    134|       const originalInvoke = tauri.invoke;
    135|       // @ts-expect-error - replacing invoke for testing
    136|       tauri.invoke = mockInvoke;
       |             ^
    137| 
    138|       await tauri.sendReaction(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/22]⎯

 FAIL  src/lib/port-protocol.test.ts > Port Protocol > Error handling > propagates errors from invoke to caller
TypeError: Cannot set property invoke of [object Module] which has only a getter
 ❯ src/lib/port-protocol.test.ts:163:13
    161|       const originalInvoke = tauri.invoke;
    162|       // @ts-expect-error - replacing invoke for testing
    163|       tauri.invoke = mockInvoke;
       |             ^
    164| 
    165|       await expect(tauri.checkSession()).rejects.toThrow("Network erro…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/22]⎯

 FAIL  src/lib/port-protocol.test.ts > Port Protocol > Error handling > does not catch or swallow command errors
TypeError: Cannot set property invoke of [object Module] which has only a getter
 ❯ src/lib/port-protocol.test.ts:178:13
    176|       const originalInvoke = tauri.invoke;
    177|       // @ts-expect-error - replacing invoke for testing
    178|       tauri.invoke = mockInvoke;
       |             ^
    179| 
    180|       // The wrapper should not catch this - it propagates to the call…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/22]⎯

 FAIL  src/lib/spec-test-naming.test.ts > Spec-to-Test Naming Convention > All specs have corresponding tests > every spec file has at least one test file
Error: The following specs have no corresponding tests:
markdown_rendering.feature
message_truncation.feature
room_archiving.feature
scroll_behavior.feature
session_management.feature
 ❯ src/lib/spec-test-naming.test.ts:85:15
     83| 
     84|       if (missingTests.length > 0) {
     85|         throw new Error(
       |               ^
     86|           `The following specs have no corresponding tests:\n${missing…
     87|         );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/22]⎯

 FAIL  src/lib/spec-test-naming.test.ts > Spec-to-Test Naming Convention > Naming convention follows documented pattern > multi-word test files use kebab-case (primary pattern)
AssertionError: expected 0 to be greater than 0
 ❯ src/lib/spec-test-naming.test.ts:123:30
    121| 
    122|       // Kebab-case should be the dominant pattern
    123|       expect(kebabCaseCount).toBeGreaterThan(0);
       |                              ^
    124|     });
    125|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/22]⎯

 FAIL  src/lib/spec-test-naming.test.ts > Spec-to-Test Naming Convention > No vacuous tests > spec_test_naming.test.ts actually validates naming
AssertionError: expected 'import { describe, it, expect } from …' not to contain 'expect(true).toBe(true)'

[32m- Expected[39m
[31m+ Received[39m

[32m- expect(true).toBe(true)[39m
[31m+ import { describe, it, expect } from "vitest";[39m
[31m+ import { readdirSync, existsSync } from "fs";[39m
[31m+ import { join } from "path";[39m
[31m+[39m
[31m+ /**[39m
[31m+  * Tests for spec-to-test naming convention compliance.[39m
[31m+  *[39m
[31m+  * This test validates that all spec files have corresponding test files[39m
[31m+  * and that the naming convention follows the documented pattern in[39m
[31m+  * INVARIANTS.md.[39m
[31m+  */[39m
[31m+[39m
[31m+ describe("Spec-to-Test Naming Convention", () => {[39m
[31m+   const specsDir = join(__dirname, "../../../specs");[39m
[31m+   const uiSrcDir = join(__dirname, "..");[39m
[31m+[39m
[31m+   // Helper to convert snake_case spec name to kebab-case test name[39m
[31m+   function specNameToTestName(specName: string): string {[39m
[31m+     return specName.replace(/_/g, "-");[39m
[31m+   }[39m
[31m+[39m
[31m+   // Helper to find test files matching a spec[39m
[31m+   function findTestFiles(testBaseName: string, searchDir: string): string[] {[39m
[31m+     const found: string[] = [];[39m
[31m+     const entries = readdirSync(searchDir, { withFileTypes: true });[39m
[31m+[39m
[31m+     for (const entry of entries) {[39m
[31m+       const fullPath = join(searchDir, entry.name);[39m
[31m+[39m
[31m+       if (entry.isDirectory() && entry.name !== "node_modules") {[39m
[31m+         found.push(...findTestFiles(testBaseName, fullPath));[39m
[31m+       } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {[39m
[31m+         const testNameWithoutExt = entry.name.replace(".test.ts", "");[39m
[31m+[39m
[31m+         // Check for exact match (kebab-case)[39m
[31m+         if (testNameWithoutExt === testBaseName) {[39m
[31m+           found.push(fullPath);[39m
[31m+         }[39m
[31m+[39m
[31m+         // Check for PascalCase variant[39m
[31m+         const pascalCase = testBaseName[39m
[31m+           .split("-")[39m
[31m+           .map((part) => part.charAt(0).toUpperCase() + part.slice(1))[39m
[31m+           .join("");[39m
[31m+[39m
[31m+         if (testNameWithoutExt === pascalCase) {[39m
[31m+           found.push(fullPath);[39m
[31m+         }[39m
[31m+[39m
[31m+         // Check for semantic equivalence (normalized comparison)[39m
[31m+         const normalizedTest = testNameWithoutExt.toLowerCase().replace(/-/g, "");[39m
[31m+         const normalizedSpec = testBaseName.toLowerCase().replace(/-/g, "");[39m
[31m+[39m
[31m+         if (normalizedTest === normalizedSpec) {[39m
[31m+           found.push(fullPath);[39m
[31m+         }[39m
[31m+       }[39m
[31m+     }[39m
[31m+[39m
[31m+     return found;[39m
[31m+   }[39m
[31m+[39m
[31m+   describe("All specs have corresponding tests", () => {[39m
[31m+     it("every spec file has at least one test file", () => {[39m
[31m+       const specFiles = readdirSync(specsDir).filter((f) =>[39m
[31m+         f.endsWith(".feature"),[39m
[31m+       );[39m
[31m+[39m
[31m+       expect(specFiles.length).toBeGreaterThan(0);[39m
[31m+[39m
[31m+       const missingTests: string[] = [];[39m
[31m+[39m
[31m+       for (const specFile of specFiles) {[39m
[31m+         const specBaseName = specFile.replace(".feature", "");[39m
[31m+         const testBaseName = specNameToTestName(specBaseName);[39m
[31m+[39m
[31m+         const testFiles = findTestFiles(testBaseName, uiSrcDir);[39m
[31m+[39m
[31m+         if (testFiles.length === 0) {[39m
[31m+           missingTests.push(specFile);[39m
[31m+         }[39m
[31m+       }[39m
[31m+[39m
[31m+       if (missingTests.length > 0) {[39m
[31m+         throw new Error([39m
[31m+           `The following specs have no corresponding tests:\n${missingTests.join("\n")}`,[39m
[31m+         );[39m
[31m+       }[39m
[31m+     });[39m
[31m+   });[39m
[31m+[39m
[31m+   describe("Naming convention follows documented pattern", () => {[39m
[31m+     it("spec names use snake_case", () => {[39m
[31m+       const specFiles = readdirSync(specsDir).filter((f) =>[39m
[31m+         f.endsWith(".feature"),[39m
[31m+       );[39m
[31m+[39m
[31m+       for (const specFile of specFiles) {[39m
[31m+         const baseName = specFile.replace(".feature", "");[39m
[31m+[39m
[31m+         // Should not contain hyphens (kebab-case) or capital letters (PascalCase)[39m
[31m+         expect(baseName).not.toMatch(/-/);[39m
[31m+         expect(baseName).not.toMatch(/[A-Z]/);[39m
[31m+       }[39m
[31m+     });[39m
[31m+[39m
[31m+     it("multi-word test files use kebab-case (primary pattern)", () => {[39m
[31m+       const testFiles = findTestFiles("", uiSrcDir).filter([39m
[31m+         (f) => !f.includes("node_modules"),[39m
[31m+       );[39m
[31m+[39m
[31m+       const kebabCaseCount = testFiles.filter((f) => {[39m
[31m+         const baseName = f.split("/").pop()!.replace(".test.ts", "");[39m
[31m+         return baseName.includes("-") && !baseName.match(/[A-Z]/);[39m
[31m+       }).length;[39m
[31m+[39m
[31m+       const pascalCaseCount = testFiles.filter((f) => {[39m
[31m+         const baseName = f.split("/").pop()!.replace(".test.ts", "");[39m
[31m+         return baseName.match(/^[A-Z]/);[39m
[31m+       }).length;[39m
[31m+[39m
[31m+       // Kebab-case should be the dominant pattern[39m
[31m+       expect(kebabCaseCount).toBeGreaterThan(0);[39m
[31m+     });[39m
[31m+   });[39m
[31m+[39m
[31m+   describe("Semantic equivalence", () => {[39m
[31m+     it("error_feedback.feature maps to error-feedback.test.ts", () => {[39m
[31m+       const testBaseName = specNameToTestName("error_feedback");[39m
[31m+       const testFiles = findTestFiles(testBaseName, uiSrcDir);[39m
[31m+[39m
[31m+       expect(testFiles.length).toBeGreaterThan(0);[39m
[31m+[39m
[31m+       const correctName = testFiles.some((f) =>[39m
[31m+         f.endsWith("error-feedback.test.ts"),[39m
[31m+       );[39m
[31m+       expect(correctName).toBe(true);[39m
[31m+     });[39m
[31m+[39m
[31m+     it("text_to_speech.feature maps to text-to-speech.test.ts", () => {[39m
[31m+       const testBaseName = specNameToTestName("text_to_speech");[39m
[31m+       const testFiles = findTestFiles(testBaseName, uiSrcDir);[39m
[31m+[39m
[31m+       expect(testFiles.length).toBeGreaterThan(0);[39m
[31m+[39m
[31m+       const correctName = testFiles.some((f) =>[39m
[31m+         f.endsWith("text-to-speech.test.ts"),[39m
[31m+       );[39m
[31m+       expect(correctName).toBe(true);[39m
[31m+     });[39m
[31m+[39m
[31m+     it("message_compose.feature maps to message-compose.test.ts", () => {[39m
[31m+       const testBaseName = specNameToTestName("message_compose");[39m
[31m+       const testFiles = findTestFiles(testBaseName, uiSrcDir);[39m
[31m+[39m
[31m+       expect(testFiles.length).toBeGreaterThan(0);[39m
[31m+[39m
[31m+       const correctName = testFiles.some([39m
[31m+         (f) =>[39m
[31m+           f.endsWith("message-compose.test.ts") ||[39m
[31m+           f.endsWith("ComposeBar.test.ts"),[39m
[31m+       );[39m
[31m+       expect(correctName).toBe(true);[39m
[31m+     });[39m
[31m+   });[39m
[31m+[39m
[31m+   describe("INVARIANTS.md documents the convention", () => {[39m
[31m+     it("INVARIANTS.md contains spec-to-test naming section", () => {[39m
[31m+       const invariantsPath = join(__dirname, "../../../INVARIANTS.md");[39m
[31m+       const { readFileSync } = require("fs");[39m
[31m+       const content = readFileSync(invariantsPath, "utf-8");[39m
[31m+[39m
[31m+       expect(content).toContain("Spec-to-test naming convention");[39m
[31m+       expect(content).toContain("kebab-case");[39m
[31m+       expect(content).toContain("foo-bar.test.ts");[39m
[31m+     });[39m
[31m+   });[39m
[31m+[39m
[31m+   describe("No vacuous tests", () => {[39m
[31m+     it("spec_test_naming.test.ts actually validates naming", () => {[39m
[31m+       // This test validates that this file itself is not a placeholder.[39m
[31m+       // It should have multiple test cases that check actual conditions.[39m
[31m+[39m
[31m+       const thisFile = __filename;[39m
[31m+       const { readFileSync } = require("fs");[39m
[31m+       const content = readFileSync(thisFile, "utf-8");[39m
[31m+[39m
[31m+       // Should contain actual assertions[39m
[31m+       const assertionCount = (content.match(/expect\(/g) || []).length;[39m
[31m+       expect(assertionCount).toBeGreaterThan(10);[39m
[31m+[39m
[31m+       // Should not have vacuous assertions like expect(true).toBe(true)[39m
[31m+       expect(content).not.toContain("expect(true).toBe(true)");[39m
[31m+       expect(content).not.toContain("expect(1).toBe(1)");[39m
[31m+     });[39m
[31m+   });[39m
[31m+ });[39m
[31m+[39m

 ❯ src/lib/spec-test-naming.test.ts:193:27
    191| 
    192|       // Should not have vacuous assertions like expect(true).toBe(tru…
    193|       expect(content).not.toContain("expect(true).toBe(true)");
       |                           ^
    194|       expect(content).not.toContain("expect(1).toBe(1)");
    195|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/22]⎯


 Test Files  3 failed | 24 passed (27)
      Tests  22 failed | 350 passed (372)
   Start at  06:16:37
   Duration  5.62s (transform 2.02s, setup 2.81s, collect 8.73s, tests 3.24s, environment 27.63s, prepare 3.82s)

error: Recipe `test` failed on line 11 with exit code 1

