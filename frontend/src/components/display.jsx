function Display({ value, expression }) {
  return (
    <div className="calculator-display">
      <div className="calculator-expression">{expression}</div>
      <div className="calculator-value">{value}</div>
    </div>
  );
}

export default Display;
