'use client'
import { useIsMounted } from "@/hooks/ismounted";
import FullScreenLoader from "./full-screen-loader";

const ClientOnlyComponent = ({ children }:any) => {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return <FullScreenLoader />;
  }

  return children;
};

export default ClientOnlyComponent;