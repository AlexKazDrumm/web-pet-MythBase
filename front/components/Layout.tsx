import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <span className="brand">
            <svg
              className="brand__mark"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M16 2l12 6v8c0 8-5 12-12 14C9 26 4 22 4 14V8l12-6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            MythBase
          </span>
          <nav className="site-header__nav">
            <a href="https://github.com/AlexKazDrumm/web-pet-MythBase">
              Репозиторий
            </a>
          </nav>
        </div>
      </header>
      <main className="page">{children}</main>
    </>
  );
}
