import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Header></Header>
      <div className="lota-site">
        <main>{children}</main>
      </div>
    </>
  );
}
