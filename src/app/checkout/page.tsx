'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  ShoppingBagIcon, 
  CreditCardIcon, 
  CheckCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { booksApi, type Book } from '@/services/api/booksApi';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');
  const qty = parseInt(searchParams.get('qty') || '1');

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Demo User',
    email: 'demo@example.com',
    address: '123 E-book Street, Digital City',
  });

  useEffect(() => {
    if (bookId) {
      fetchBook();
    } else {
      setLoading(false);
    }
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const response = await booksApi.getAllBooks();
      if (response.success) {
        const found = response.data.find(b => b.id === bookId || (b as any)._id === bookId);
        setBook(found || null);
      }
    } catch (error) {
      console.error('Error fetching book for checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    setSubmitting(true);
    try {
      const priceVal = parseFloat(book.price.replace('$', ''));
      const subtotal = priceVal * qty;
      const gstPercentage = book.gst || 0;
      const gstAmount = subtotal * (gstPercentage / 100);
      const totalAmount = subtotal + gstAmount;

      const response = await fetch('/api/v1/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id || (book as any)._id,
          title: book.title,
          price: priceVal,
          quantity: qty,
          gst: gstPercentage,
          totalAmount: totalAmount,
          type: 'buy_now',
          customerName: formData.name,
          customerEmail: formData.email
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrderSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!book && !loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-4">No book selected for checkout</h2>
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
          <ArrowLeftIcon className="w-5 h-5" /> Back to Store
        </Link>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Thank you for your purchase. Your order for "{book?.title}" has been placed successfully. 
          The details have been saved to the Admin Panel.
        </p>
        <div className="animate-pulse text-indigo-400 text-sm">Redirecting to homepage...</div>
        <Link 
          href="/" 
          className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Go Back Now
        </Link>
      </div>
    );
  }

  const priceVal = parseFloat(book!.price.replace('$', ''));
  const subtotal = priceVal * qty;
  const gstPercentage = book!.gst || 0;
  const gstAmount = subtotal * (gstPercentage / 100);
  const totalAmount = subtotal + gstAmount;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-dm-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to book details</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
              <p className="text-gray-400">Complete your purchase by providing your details below.</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <CreditCardIcon className="w-5 h-5 text-indigo-400" />
                  Customer Information
                </h3>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-400">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-400">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-sm text-amber-200/80 leading-relaxed">
                  <strong>Demo Mode:</strong> Payment integration is currently in sandbox. No actual charging will occur, but the order will be persisted in the Admin Panel.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-5 h-5" />
                    Place Order (${totalAmount.toFixed(2)})
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Summary Section */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white">Order Summary</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                    <Image
                      src={book!.image || ''}
                      alt={book!.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-bold text-white leading-tight mb-1">{book!.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        <BookOpenIcon className="w-3.5 h-3.5 text-indigo-400" />
                        {book!.category}
                      </div>
                    </div>
                    <div className="text-indigo-400 font-bold">{book!.price}</div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-gray-400">
                    <span>Price</span>
                    <span>{book!.price}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Quantity</span>
                    <span>x{qty}</span>
                  </div>
                  {gstPercentage > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>GST ({gstPercentage}%)</span>
                      <span>${gstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Service Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-bold pt-4 border-t border-gray-800">
                    <span>Total</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-800/30">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <div className="p-2 bg-gray-700/50 rounded-lg">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  </div>
                  <span>Secure checkout with 128-bit encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
