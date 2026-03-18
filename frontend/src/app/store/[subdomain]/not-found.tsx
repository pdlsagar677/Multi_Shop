import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-200 flex items-center justify-center">
          <span className="text-4xl font-black text-gray-400">?</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">Store Not Found</h1>
        <p className="text-gray-500 mb-8">
          The store you&apos;re looking for doesn&apos;t exist or may have been removed.
          Please check the URL and try again.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
