import type { ComponentPropsWithRef } from "react";
import kuanLogo from "../../../app/src/main/res/drawable-nodpi/kuan_logo.png";

export { kuanLogo };

export default function Logo(props: ComponentPropsWithRef<"img">) {
  return <img src={kuanLogo} alt="" {...props} />;
}
