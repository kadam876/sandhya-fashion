import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gray-900 border-b border-gray-800 text-white py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Terms and Conditions</h1>
          <p className="text-lg text-emerald-100/80 font-medium max-w-2xl mx-auto">
            Please read these terms carefully before utilizing the Sandhya Fashion wholesale platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12 prose prose-emerald max-w-none text-gray-600">
          <p className="font-bold text-gray-900 text-lg mb-8">Last Updated: April 2026</p>
          
          <p className="mb-8">
            Welcome to Sandhya Fashion. By accessing or using our B2B wholesale platform, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Return and Refund Policy (Core Term)</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Conditions for Return:</strong> We accept returns only in the event that the parcel is received in a damaged or defective condition.</li>
            <li><strong>Reporting:</strong> To initiate a return, you must contact us immediately upon receipt of the damaged goods.</li>
            <li><strong>Requirement:</strong> For a successful return claim, the customer must provide proof of damage (such as an unboxing video or clear photographs of the defect).</li>
            <li><strong>Wholesale Nature:</strong> As we deal in wholesale sets, individual pieces cannot be returned unless the entire set is defective or as otherwise agreed upon by management.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Business Model (Wholesale Sets)</h3>
          <p>
            Sandhya Fashion operates as a B2B platform. Products are sold exclusively in "Sets" (typically comprising sizes M, L, XL, and XXL). By placing an order, the retailer acknowledges that they are purchasing a wholesale unit and not individual retail pieces.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Pricing and Billing</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Wholesale Price:</strong> All prices listed are "per piece" unless otherwise stated as a "set price."</li>
            <li><strong>Taxes and Fees:</strong> Every order is subject to a 5% GST and a 2% Platform Charge, which will be clearly calculated and displayed in the live bill summary at checkout.</li>
            <li><strong>Price Changes:</strong> We reserve the right to modify prices at any time without prior notice based on market fluctuations.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Shipping and Delivery</h3>
          <p>
            We aim to process and dispatch orders within the timeframe communicated at the time of purchase. Sandhya Fashion is not liable for delays caused by third-party logistics partners or external factors (e.g., weather, strikes, or festive seasons).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">5. User Responsibilities</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and JWT-protected access.</li>
            <li><strong>Accurate Information:</strong> Users must provide valid GST numbers and accurate business addresses to ensure proper billing and delivery.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">6. Virtual Try-On and AI Features</h3>
          <p>
            The Virtual Try-On feature is provided as a visual aid to assist in purchasing decisions. While we strive for accuracy, the digital overlay may not be a 100% exact representation of the physical fabric drape or color. User photos processed via AI are used for real-time visualization only and are not stored on our permanent servers.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">7. Limitation of Liability</h3>
          <p>
            Sandhya Fashion shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the platform or from any products purchased through the site.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">8. Contact Information</h3>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p className="mb-2">For any queries regarding damaged parcels, returns, or general terms, please contact:</p>
            <p className="font-bold text-gray-900">Email: Sandhyafashion39@gmail.com</p>
            <p className="font-bold text-gray-900">Phone: +91 7574927364</p>
            <p className="font-bold text-gray-900">Address: Shop No- B/5083, Upper Ground Floor, Global Textile Market Surat 395010</p>
          </div>


          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium text-gray-500">Have questions about our terms?</p>
            <Link to="/contact" className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-colors">
              <span>Contact Support</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
