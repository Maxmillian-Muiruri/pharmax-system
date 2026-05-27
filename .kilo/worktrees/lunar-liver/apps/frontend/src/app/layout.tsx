import { Outlet } from "react-router-dom";
import type { TNodeChildrentType } from "../types";

export default function RootLayout({ children }: Readonly<TNodeChildrentType>) {
  return children ? <>{children}</> : <Outlet />;
}
