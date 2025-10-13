export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-16">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Personalized Book Summaries
        </h1>
        <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get AI-generated summaries tailored to your reading preferences and background
        </p>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition">
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-3">Choose a Book</h3>
            <p className="text-gray-600">Browse our library of books and select the one you want to learn about</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-3">Personalize</h3>
            <p className="text-gray-600">Tell us about your background and what you want to focus on</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-3">Get Your Summary</h3>
            <p className="text-gray-600">Receive a summary tailored specifically to your needs and interests</p>
          </div>
        </div>
      </section>

      {/* Coming Soon Banner */}
      <section className="text-center py-12 mt-16 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Platform Coming Soon
        </h2>
        <p className="text-gray-600 mb-6">
          We're working hard to bring you the best personalized book summary experience
        </p>
        <p className="text-sm text-gray-500">
          Built with Next.js, Supabase, and AI-powered personalization
        </p>
      </section>
    </div>
  );
}
