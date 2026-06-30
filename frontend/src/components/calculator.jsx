import { useEffect, useMemo, useState } from "react";
import Display from "./display.jsx";
import Buttons from "./buttons.jsx";
import { getHistory, saveHistory, softDeleteHistory } from "../services/api.js";

const operations = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => (b === 0 ? "Error" : a / b),
  "%": (a, b) => (a * b) / 100,
};

function formatExpression(valueA, operator, valueB) {
  if (!operator) return valueA;
  return `${valueA} ${operator} ${valueB}`;
}

function Calculator() {
  const [displayValue, setDisplayValue] = useState("0");
  const [valueA, setValueA] = useState("");
  const [operator, setOperator] = useState("");
  const [valueB, setValueB] = useState("");
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("Ready");
  const [historyError, setHistoryError] = useState("");

  const expression = useMemo(
    () => formatExpression(valueA || "0", operator, valueB || ""),
    [valueA, operator, valueB],
  );

  useEffect(() => {
    async function loadHistory() {
      setStatus("Loading history...");
      try {
        const data = await getHistory();
        setHistory(Array.isArray(data) ? data : []);
        setStatus("Ready");
        setHistoryError("");
      } catch (error) {
        console.error("Failed to load history:", error);
        setStatus("Ready");
        setHistoryError("Could not load history. Is the backend running?");
      }
    }
    loadHistory();
  }, []);

  async function addHistory(entry) {
    setStatus("Saving...");
    try {
      const saved = await saveHistory(entry);
      setHistory((prev) => [saved, ...prev]);
      setStatus("Saved ✓");
      setTimeout(() => setStatus("Ready"), 1500);
    } catch (error) {
      console.error("Failed to save history:", error);
      setStatus("Save failed");
      setTimeout(() => setStatus("Ready"), 2000);
    }
  }

  async function handleSoftDelete(id) {
    try {
      await softDeleteHistory(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete history item:", error);
      setHistoryError("Could not remove item. Try again.");
      setTimeout(() => setHistoryError(""), 2000);
    }
  }

  function handleNumber(number) {
    if (!operator) {
      const next =
        valueA === "0" || valueA === "" ? number : `${valueA}${number}`;
      setValueA(next);
      setDisplayValue(next);
      return;
    }
    const next =
      valueB === "0" || valueB === "" ? number : `${valueB}${number}`;
    setValueB(next);
    setDisplayValue(next);
  }

  function handleOperator(nextOperator) {
    if (!valueA) return;
    if (valueB) {
      computeResult(nextOperator);
      return;
    }
    setOperator(nextOperator);
    setDisplayValue(nextOperator);
  }

  function handleClear() {
    setValueA("");
    setOperator("");
    setValueB("");
    setDisplayValue("0");
    setStatus("Ready");
  }

  function handleDelete() {
    if (valueB) {
      const next = valueB.slice(0, -1);
      setValueB(next);
      setDisplayValue(next || "0");
      return;
    }
    if (operator) {
      setOperator("");
      setDisplayValue(valueA || "0");
      return;
    }
    const next = valueA.slice(0, -1);
    setValueA(next);
    setDisplayValue(next || "0");
  }

  function computeResult(nextOperator = "") {
    const a = Number(valueA);
    const b = Number(valueB);
    if (!operator || valueB === "") return;
    const result = operations[operator](a, b);
    const resultText = result === "Error" ? "Error" : String(result);
    const expressionText = `${valueA} ${operator} ${valueB}`;
    setDisplayValue(resultText);
    setValueA(resultText === "Error" ? "" : resultText);
    setValueB("");
    setOperator(nextOperator);
    if (resultText !== "Error") {
      addHistory({
        expression: expressionText,
        result: resultText,
        operation: operator,
        valueA: a,
        valueB: b,
      });
    }
  }

  function handlePercent() {
    // % acts as an operator: type 89 → % → 50 → = gives (89 * 50) / 100
    if (!valueA) return;
    if (valueB) {
      // already have both sides, resolve first then set % as next operator
      computeResult("%");
      return;
    }
    setOperator("%");
    setDisplayValue("%");
  }
  const buttons = [
    { label: "C", action: handleClear, type: "utility" },
    { label: "DEL", action: handleDelete, type: "utility" },
    {
      label: "%",
      action: () => handlePercent(),
      type: "operator",
    },
    { label: "/", action: () => handleOperator("/"), type: "operator" },
    { label: "7", action: () => handleNumber("7") },
    { label: "8", action: () => handleNumber("8") },
    { label: "9", action: () => handleNumber("9") },
    { label: "*", action: () => handleOperator("*"), type: "operator" },
    { label: "4", action: () => handleNumber("4") },
    { label: "5", action: () => handleNumber("5") },
    { label: "6", action: () => handleNumber("6") },
    { label: "-", action: () => handleOperator("-"), type: "operator" },
    { label: "1", action: () => handleNumber("1") },
    { label: "2", action: () => handleNumber("2") },
    { label: "3", action: () => handleNumber("3") },
    { label: "+", action: () => handleOperator("+"), type: "operator" },
    { label: "0", action: () => handleNumber("0"), span: 2 },
    { label: ".", action: () => handleNumber(".") },
    { label: "=", action: () => computeResult(), type: "operator" },
  ];

  return (
    <div className="calculator-shell">
      <div className="calculator-card">
        <div className="calculator-header">
          <div>
            <h1>Smart Calculator by Wahad</h1>
            <p>Fast results, history saved automatically</p>
          </div>
          <div className="status-pill">{status}</div>
        </div>
        <Display value={displayValue} expression={expression} />
        <Buttons buttons={buttons} />
      </div>

      <section className="history-panel">
        <div className="history-header">
          <h2>Calculation History</h2>
          <p>
            Results are saved to MongoDB. Remove button soft-deletes from the
            database.
          </p>
        </div>

        {historyError && <div className="history-error">{historyError}</div>}

        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">
              No history yet. Try a calculation.
            </div>
          ) : (
            history.map((item) => (
              <div key={item._id} className="history-item">
                <div>
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                </div>
                <button
                  type="button"
                  className="history-delete"
                  onClick={() => handleSoftDelete(item._id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Calculator;
