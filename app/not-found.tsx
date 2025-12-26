import Link from "next/link";

export default function NotFound() {
    return (
        <div
            className="
        min-h-screen flex flex-col items-center justify-center
        bg-white text-center px-6
      "
        >
            {/* Illustration */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="mb-8 w-[500px] rounded-xl"
            >
                <source src="/error404.mp4" type="video/mp4" />
                <img src="/Error404.png" alt="404" />
            </video>


            <h1 className="text-5xl font-[1000] text-base-content">
                Oh No! Error 404
            </h1>

            <p className="mt-3 text-base-content/70 text-lg max-w-md">
                Oops! That page seems to have taken a detour.
                Let us guide you back to your destination.
            </p>

            <Link
                href="/"
                className="
          mt-8 px-8 py-3 rounded-full
          bg-neutral text-neutral-content
          text-sm font-medium hover:opacity-90
        "
            >
                Back to Homepage
            </Link>

            {/* เครดิต Figma */}
            <p className="mt-12 text-xs text-base-content/40">
                Design inspired by{" "}
                <a
                    href="https://www.figma.com/design/782pqKE934bOXMIRlK8xb0/Page-State-UI-Web-Design--Community-"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-base-content"
                >
                    Page State UI – Figma Community
                </a>
            </p>
        </div>
    );
}
