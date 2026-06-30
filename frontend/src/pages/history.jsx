import { useEffect, useState } from "react";
import { getHistory, saveHistory } from "../services/api";

function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  async function handleSave() {
    try {
      const item = {
        expression: "2+2",
        result: "4",
        operation: "+",
        valueA: "2",
        valueB: "2",
      };
      await saveHistory(item);
      const updated = await getHistory();
      setHistory(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <button onClick={handleSave}>Save history item</button>
      {error && <p>{error}</p>}
      <ul>
        {history.map((item) => (
          <li key={item._id}>
            {item.expression} = {item.result}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HistoryPanel;
