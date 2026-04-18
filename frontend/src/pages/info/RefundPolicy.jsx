import { ArrowRight, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  return (
    <div className="bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gray-900 border-b border-gray-800 text-white py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <RefreshCcw size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Refund & Return Policy</h1>
          <p className="text-lg text-emerald-100/80 font-medium max-w-2xl mx-auto">
            Comprehensive guidelines on returns, damaged goods, and wholesale credits.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12 prose prose-emerald max-w-none text-gray-600">
          <p className="font-bold text-gray-900 text-lg mb-8">Wholesale Policy — Last Updated: April 2026</p>
          
          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Conditions for Return</h3>
          <p>
            We accept returns <strong>exclusively</strong> in the event that the parcel is received in a damaged or defective condition. Due to the B2B wholesale nature of our platform, we do not accept returns for any other reasons (e.g., buyer's remorse or unsold inventory).
          </p>
          <p className="mt-4">
            As we deal in wholesale sets, individual pieces cannot be returned unless the entire set is defective or as otherwise agreed upon by management.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">2. Immediate Reporting Required</h3>
          <p>
            To initiate a return, you must contact us <strong>immediately upon receipt</strong> of the damaged goods. Claims made after the initial delivery inspection period may not be honored as we cannot verify when the damage occurred.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">3. Mandatory Proof of Damage</h3>
          <p>
            For a successful return claim, the customer <strong>must provide clear proof of damage</strong>. This includes:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>An unboxing video showing the parcel's condition as it was received.</li>
            <li>Clear, high-resolution photographs of the specific defects or damaged packaging.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-10 mb-4">4. Resolution Process</h3>
          <p>
            Once your claim is verified with the required proof, our management will review the case. Approved returns for damaged wholesale sets will be handled via replacement or platform credit, as determined by Sandhya Fashion management.
          </p>

          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium text-gray-500">Need to report an issue with an order?</p>
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

export default RefundPolicy;
