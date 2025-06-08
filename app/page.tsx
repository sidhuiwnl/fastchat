import Link from "next/link";


export default function Home() {
  return (
    <div>
      <Link href={"/chat/1"}>
          Go To Chat
      </Link>
    </div>
  );
}
