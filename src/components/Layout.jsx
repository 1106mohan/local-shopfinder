import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="d-flex">
        <Sidebar />
        <div className="p-4 w-100">{children}</div>
      </div>
    </>
  );
}

export default Layout;   // ⭐ THIS LINE IS IMPORTANT
