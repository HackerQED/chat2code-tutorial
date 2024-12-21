import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          chat2code <span className="text-[hsl(280,100%,70%)]">Demo</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-8">
          <Link
            className="flex max-w-2xl flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            href="/playground"
          >
            <h3 className="text-2xl font-bold">WebContainer Playground →</h3>
            <div className="text-lg">
              A demo of WebContainer capabilities including:
              <ul className="mt-2 list-disc pl-6">
                <li>In-browser terminal with jsh shell</li>
                <li>File system operations</li>
                <li>NPM package management</li>
                <li>Command execution</li>
              </ul>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
