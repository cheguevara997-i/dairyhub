import { Link } from "react-router-dom";

function BackButton({
  to,
  text = "← Back"
}) {
  return (
    <Link
      to={to}
      className="back-button"
    >
      {text}
    </Link>
  );
}

export default BackButton;