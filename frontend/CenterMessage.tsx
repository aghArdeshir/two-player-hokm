export default function CenterMessage(props: { children: React.ReactChild }) {
  return (
    <div className="totally-center">
      <div className="circular" />
      {props.children}
    </div>
  );
}
