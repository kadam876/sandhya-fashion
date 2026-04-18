import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Award, Truck, Shield } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-gray-900 border-b border-gray-800 text-white py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">About Sandhya Fashion</h1>
          <p className="text-lg text-emerald-100/80 font-medium max-w-2xl mx-auto">
            Your trusted partner in wholesale fashion since 2010, delivering premium quality apparel at factory-direct prices.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At Sandhya Fashion, we bridge the gap between premium quality manufacturing and retail businesses. 
                Our mission is to empower retailers with access to factory-direct pricing without compromising on quality or style.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We believe that every retailer deserves the opportunity to offer their customers exceptional fashion 
                at competitive prices, and we're committed to making that a reality through our extensive wholesale network.
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <img 
                src="https://picsum.photos/seed/about1/500/400.jpg" 
                alt="About Sandhya Fashion" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00B67A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-[#00B67A]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600">
                Premium fabrics, expert craftsmanship, and rigorous quality control in every piece.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00B67A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={32} className="text-[#00B67A]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick dispatch and reliable shipping to keep your inventory stocked and ready.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00B67A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-[#00B67A]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust & Reliability</h3>
              <p className="text-gray-600">
                Building long-term partnerships through transparency, consistency, and exceptional service.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00B67A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-[#00B67A]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Focus</h3>
              <p className="text-gray-600">
                Your success is our success. We're dedicated to supporting our retail partners.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#00B67A] rounded-lg p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80">Retail Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">Products Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">14</div>
              <div className="text-white/80">Years in Business</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-white/80">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
