import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 via-orange-700 to-red-800 mb-6">
              Discover Traditional Arts
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Connect with skilled artisans and explore unique handcrafted pieces that preserve cultural heritage
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Explore Artworks
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-amber-600 text-amber-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-600 hover:text-white transition-all transform hover:scale-105"
              >
                Join as Artisan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose ArtisanHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Authentic Crafts</h3>
              <p className="text-gray-600">
                Discover genuine traditional art forms passed down through generations of skilled artisans.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Support Artisans</h3>
              <p className="text-gray-600">
                Directly support local artisans and help preserve traditional art forms for future generations.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Unique Stories</h3>
              <p className="text-gray-600">
                Each piece comes with its own story, connecting you to the rich cultural heritage behind the art.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Traditional Art Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Pottery', emoji: '🏺', color: 'from-amber-400 to-orange-500' },
              { name: 'Textiles', emoji: '🧵', color: 'from-orange-400 to-red-500' },
              { name: 'Woodwork', emoji: '🪵', color: 'from-red-400 to-pink-500' },
              { name: 'Jewelry', emoji: '💎', color: 'from-pink-400 to-purple-500' },
              { name: 'Paintings', emoji: '🎨', color: 'from-purple-400 to-indigo-500' },
              { name: 'Sculptures', emoji: '🗿', color: 'from-indigo-400 to-blue-500' },
              { name: 'Metalwork', emoji: '⚒️', color: 'from-blue-400 to-cyan-500' },
              { name: 'Ceramics', emoji: '🏺', color: 'from-cyan-400 to-teal-500' }
            ].map((category, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-2xl">{category.emoji}</span>
                </div>
                <h3 className="text-center font-semibold text-gray-800">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-800 via-orange-700 to-red-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Share Your Art?
          </h2>
          <p className="text-xl text-amber-200 mb-8">
            Join our community of talented artisans and showcase your traditional crafts to the world.
          </p>
          <Link 
            to="/login" 
            className="bg-white text-amber-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export default Home;