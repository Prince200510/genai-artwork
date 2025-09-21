function Footer() {
  return (
    <footer className="bg-gradient-to-r from-amber-900 via-orange-800 to-red-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">ArtisanHub</h3>
            <p className="text-amber-200 mb-4">
              Connecting traditional artisans with art lovers worldwide. 
              Discover unique handcrafted pieces that tell stories of heritage and skill.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-500 cursor-pointer transition-colors">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-500 cursor-pointer transition-colors">
                <span className="text-sm font-bold">t</span>
              </div>
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center hover:bg-amber-500 cursor-pointer transition-colors">
                <span className="text-sm font-bold">i</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-amber-200">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Artisan Stories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Art Categories</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-amber-200">
              <li>Email: GenAi@artisanhub.com</li>
              <li>Phone: 9987742369</li>
              <li>Address: Mumbai</li>
              <li>Creative District, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-amber-700 mt-8 pt-8 text-center text-amber-300">
          <p>&copy; 2025 ArtisanHub. Celebrating traditional arts and crafts.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;