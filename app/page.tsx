import Link from "next/link";
import { ModeToggle } from "@/components/mode-toogle";

export default function Home() {
  return (
    <div>
      <ModeToggle/>
      <Link href={"/chat/1"}>

          Go To Chat
      </Link>
    </div>
  );
}
