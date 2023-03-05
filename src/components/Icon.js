export default function Icon(props) {
  const { icon, size } = props;
  return (
    <i
      className={`bi bi-${icon}`}
      style={{
        fontSize: size ? size : "inherit",
        padding: "0 5px",
      }}
    ></i>
  );
}
