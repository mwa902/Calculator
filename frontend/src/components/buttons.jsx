function Buttons({ buttons }) {
  return (
    <div className="calculator-buttons">
      {buttons.map((button) => (
        <button
          key={button.label}
          type="button"
          className={`button ${button.type || ""} ${button.span === 2 ? "span-two" : ""}`}
          onClick={button.action}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}

export default Buttons;
