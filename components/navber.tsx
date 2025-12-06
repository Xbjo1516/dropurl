import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./Language/LanguageSwitcher";

export function Navbar() {
  return (
    <div className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-40">

      <div className="flex-1">
        <Link href="/" className="btn btn-ghost normal-case text-xl font-extrabold">
          <span className="text-primary">Drop</span>
          <span className="ml-1">URL</span>
        </Link>
      </div>

      <div className="flex-none flex items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
