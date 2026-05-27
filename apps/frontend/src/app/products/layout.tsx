import React from "react";
import { Outlet } from "react-router-dom";
import { LayoutWrapper } from "../../components/dev/core";

export default function ProductsListLayout() {
  return (
    <LayoutWrapper
      {...{
        children: (
          <React.Fragment>
            <Outlet />
          </React.Fragment>
        ),
      }}
    />
  );
}
