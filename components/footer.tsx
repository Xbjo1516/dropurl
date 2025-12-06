"use client";

export default function Footer() {
  return (
    <footer className="bg-base-100 text-base-content text-xs mt-16">
      <div className="border-t border-base-300">
        <div className="max-w-[1280px] mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4 opacity-80">

          <div className="flex items-center gap-3">
            <span>
              Copyright © {new Date().getFullYear()} DropURL — All rights reserved
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/terms-and-conditions"
              className="hover:text-primary transition-colors"
            >
              Terms &amp; Conditions
            </a>
            <span className="opacity-60">|</span>
            <a
              href="/privacy-policy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
