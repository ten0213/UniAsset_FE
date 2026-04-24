import Sidebar from './Sidebar';

export default function SidebarLayout(props: any) {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <div className="sidebar-content">{props.children}</div>
    </div>
  );
}
