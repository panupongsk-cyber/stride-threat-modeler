/**
 * STRIDE-lite Game Unit Tests - Node verification script
 */

const assert = require("assert");
const { LEVELS, calculateScore, evaluateThreatOutcome } = require("./game-core.js");

console.log("=========================================");
console.log("RUNNING STRIDE THREAT MODELER TESTS...");
console.log("=========================================");

try {
  // Test 1: Verify question bank integrity
  console.log("Test 1: Verifying DFD Levels & Threats structures...");
  assert.strictEqual(LEVELS.length, 3, "Should have exactly 3 DFD levels.");
  
  LEVELS.forEach((level, idx) => {
    console.log(`- Level ${level.id}: ${level.name}`);
    assert.ok(level.nodes.length >= 4, `Level ${level.id} should have at least 4 nodes.`);
    assert.ok(level.flows.length >= 3, `Level ${level.id} should have at least 3 flow lines.`);
    assert.strictEqual(level.threats.length, 3, `Level ${level.id} should have exactly 3 threat events.`);
    
    level.threats.forEach(threat => {
      assert.ok(threat.id, "Threat ID is missing.");
      assert.ok(["S", "T", "R", "I", "D", "E"].includes(threat.stride), `Threat stride category '${threat.stride}' is invalid.`);
      assert.ok(threat.targetNode, "Threat targetNode is missing.");
      assert.ok(threat.mitigation, "Threat mitigation control is missing.");
      assert.strictEqual(threat.controls.length, 4, "Threat should present exactly 4 candidate controls.");
      assert.ok(threat.controls.includes(threat.mitigation), "Threat controls list must include the correct mitigation answer.");
    });
  });
  console.log("✔ DFD architectural levels verified successfully.");

  // Test 2: Verify score calculation logic
  console.log("Test 2: Verifying calculateScore bounds...");
  const basePoints = 100;
  assert.strictEqual(calculateScore(basePoints, 0, 60), 150, "Zero elapsed time should reward maximum points + speed bonus.");
  assert.strictEqual(calculateScore(basePoints, 30, 60), 125, "Mid-range elapsed time should reward decayed speed bonus.");
  assert.strictEqual(calculateScore(basePoints, 60, 60), 50, "Exceeding time limit should reward minimum floor points.");
  console.log("✔ Score calculations verified successfully.");

  // Test 3: Verify learning outcome logic
  console.log("Test 3: Verifying evaluateThreatOutcome classifications...");
  // Case A: 100% Accuracy (9/9 correct) -> Elite Architect
  const perfectScores = {
    S: { correct: 2, total: 2 },
    T: { correct: 2, total: 2 },
    R: { correct: 1, total: 1 },
    I: { correct: 1, total: 1 },
    D: { correct: 1, total: 1 },
    E: { correct: 2, total: 2 }
  };
  const perfectOutcome = evaluateThreatOutcome(perfectScores);
  assert.strictEqual(perfectOutcome.accuracy, 100);
  assert.strictEqual(perfectOutcome.title, "Elite Threat Modeling Architect");
  assert.strictEqual(perfectOutcome.badge, "🏆");

  // Case B: 55% Accuracy (5/9 correct) -> AppSec Analyst (>= 45%)
  const partialScores = {
    S: { correct: 1, total: 2 },
    T: { correct: 1, total: 2 },
    R: { correct: 0, total: 1 },
    I: { correct: 1, total: 1 },
    D: { correct: 1, total: 1 },
    E: { correct: 1, total: 2 }
  };
  const partialOutcome = evaluateThreatOutcome(partialScores);
  assert.ok(partialOutcome.accuracy > 55 && partialOutcome.accuracy < 56);
  assert.strictEqual(partialOutcome.title, "AppSec Analyst");
  assert.strictEqual(partialOutcome.badge, "💻");

  // Case C: 0% Accuracy -> Novice
  const failedScores = {
    S: { correct: 0, total: 2 },
    T: { correct: 0, total: 2 },
    R: { correct: 0, total: 1 },
    I: { correct: 0, total: 1 },
    D: { correct: 0, total: 1 },
    E: { correct: 0, total: 2 }
  };
  const failedOutcome = evaluateThreatOutcome(failedScores);
  assert.strictEqual(failedOutcome.accuracy, 0);
  assert.strictEqual(failedOutcome.title, "Novice Threat Modeler");
  assert.strictEqual(failedOutcome.badge, "🔍");
  console.log("✔ Learning outcomes mapping verified successfully.");

  console.log("\n=========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! [PASS]");
  console.log("=========================================");
  process.exit(0);

} catch (error) {
  console.error("\n❌ TEST SUITE FAILED:");
  console.error(error);
  process.exit(1);
}
